import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StravaService } from '../../../core/services/strava.service';
import { AuthService } from '../../../core/services/auth.service';
import { WorkoutActivitiesService, WorkoutActivity } from '../../../core/services/workout-activities.service';
import { WorkoutSelectorComponent } from '../../../shared/components/workout-selector/workout-selector.component';
import { switchMap, take } from 'rxjs';

type ComposerAction = {
  icon: 'highlight' | 'stats' | 'analysis' | 'workout' | 'route' | 'achievement' | 'challenge';
  label: string;
  description: string;
  requiresStrava: boolean;
};

type HighlightSuggestion = {
  headline: string;
  subHeadline: string;
  bulletPoints: string[];
};

@Component({
  selector: 'app-post-composer',
  templateUrl: './post-composer.component.html',
  styleUrls: ['./post-composer.component.scss']
})
export class PostComposerComponent {
  @Output() readonly submitPost = new EventEmitter<{ content: string; workoutActivityIds?: string[] }>();

  isExpanded = false;
  postContent = '';
  selectedWorkouts: WorkoutActivity[] = [];
  showWorkoutSelector = false;
  activeAction: ComposerAction['icon'] | null = null;
  highlightSuggestion: HighlightSuggestion | null = null;
  private readonly workoutAccents: Record<string, string> = {
    run: '#1d9bf0',
    ride: '#1780d6',
    swim: '#16b0ff',
    workout: '#1d9bf0',
    walk: '#45c1ff',
    hike: '#4ea6ff',
    alpineski: '#4ea6ff',
    snowboard: '#4ea6ff',
    kayaking: '#16b0ff'
  };

  private readonly highlightThemes = ['Virada épica', 'Recorde pessoal', 'Defesa milagrosa', 'Estratégia vencedora', 'Retorno triunfal'];
  private readonly highlightTones = ['🔥 Energia máxima', '⚡ Ritmo acelerado', '🎯 Precisão cirúrgica', '💥 Intensidade total', '🌟 Brilho absoluto'];
  private readonly highlightHooks = ['que mudou o jogo', 'que arrancou aplausos', 'que virou o placar', 'que calou o estádio', 'que garantiu a vitória'];
  private readonly highlightStats = [
    'Velocidade máxima: {statValue} km/h',
    'Sequência de {statValue} partidas sem derrota',
    'Aproveitamento de {statValue}% nas finalizações',
    'Índice de recuperação: {statValue}%',
    'Impacto defensivo: {statValue} interceptações'
  ];
  private readonly statSamples = ['32', '87', '94', '6', '3'];

  readonly actions: ComposerAction[] = [
    { icon: 'highlight', label: 'Highlight', description: 'Compartilhe o momento decisivo', requiresStrava: false },
    { icon: 'stats', label: 'Estatísticas', description: 'Mostre seus números e desempenho', requiresStrava: true },
    { icon: 'analysis', label: 'Análise', description: 'Análise detalhada do treino', requiresStrava: true },
    { icon: 'workout', label: 'Treinos', description: 'Adicione treinos do Strava', requiresStrava: true },
    { icon: 'route', label: 'Percurso', description: 'Compartilhe seu percurso', requiresStrava: true },
    { icon: 'achievement', label: 'Conquista', description: 'Celebre suas conquistas', requiresStrava: true },
    { icon: 'challenge', label: 'Desafio', description: 'Crie ou participe de desafios', requiresStrava: false }
  ];

  constructor(
    private readonly stravaService: StravaService,
    private readonly authService: AuthService,
  public readonly workoutService: WorkoutActivitiesService,
    private readonly dialog: MatDialog
  ) {}

  get userName(): string {
    return this.authService.currentUser?.name || 'Usuário';
  }

  get userTitle(): string {
    const provider = this.authService.currentUser?.provider;
    return provider ? `Comentarista esportivo na ${provider}` : 'Comentarista esportivo na EsporTz';
  }

  get userInitials(): string {
    return this.computeInitials(this.userName);
  }

  private computeInitials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  get isStravaConnected(): boolean {
    return this.stravaService.isConnected;
  }

  get hasSelectedWorkouts(): boolean {
    return this.selectedWorkouts.length > 0;
  }

  get selectedWorkoutsCount(): number {
    return this.selectedWorkouts.length;
  }

  get selectedWorkoutsSummary(): string {
    if (this.selectedWorkouts.length === 0) return '';

    if (this.selectedWorkouts.length === 1) {
      return this.selectedWorkouts[0].name;
    }

    const types = [...new Set(this.selectedWorkouts.map(w => w.type))];
    if (types.length === 1) {
      return `${this.selectedWorkouts.length} ${this.getWorkoutTypeName(types[0]).toLowerCase()}(s)`;
    }

    return `${this.selectedWorkouts.length} treinos`;
  }

  get canSubmit(): boolean {
    const hasContent = this.postContent.trim().length > 0;
    const hasWorkouts = this.selectedWorkouts.length > 0;
    return hasContent || hasWorkouts;
  }

  openComposer(): void {
    this.isExpanded = true;
  }

  handleCancel(): void {
    this.isExpanded = false;
    this.postContent = '';
    this.selectedWorkouts = [];
    this.workoutService.clearActivitySelection();
    this.activeAction = null;
    this.highlightSuggestion = null;
  }

  handleSubmit(): void {
    const trimmed = this.postContent.trim();
    if (!this.canSubmit) {
      return;
    }

    const workoutActivityIds = this.selectedWorkouts.length > 0
      ? this.selectedWorkouts.map(w => w.id)
      : undefined;

    this.submitPost.emit({
      content: trimmed || 'Compartilhando meus treinos',
      workoutActivityIds
    });

    this.postContent = '';
    this.selectedWorkouts = [];
    this.workoutService.clearActivitySelection();
    this.isExpanded = false;
    this.activeAction = null;
    this.highlightSuggestion = null;
  }

  handleActionClick(action: ComposerAction): void {
    if (action.requiresStrava && !this.isStravaConnected) {
      if (confirm('Esta funcionalidade requer conexão com o Strava. Deseja conectar agora?')) {
        this.stravaService.connectToStrava('/');
      }
      return;
    }

    if (action.icon === 'workout') {
      this.activeAction = 'workout';
      this.openWorkoutSelector();
      return;
    }

    this.activeAction = this.activeAction === action.icon ? null : action.icon;

    if (this.activeAction) {
      this.ensureExpanded();

      if (this.activeAction === 'highlight') {
        this.ensureHighlightSuggestion();
      }
    }
  }

  private ensureExpanded(): void {
    if (!this.isExpanded) {
      this.isExpanded = true;
    }
  }

  private ensureHighlightSuggestion(): void {
    if (!this.highlightSuggestion) {
      this.highlightSuggestion = this.generateHighlightSuggestion();
    }
  }

  private generateHighlightSuggestion(): HighlightSuggestion {
    const theme = this.pickRandom(this.highlightThemes);
    const tone = this.pickRandom(this.highlightTones);
    const hook = this.pickRandom(this.highlightHooks);

    const statTemplate = this.pickRandom(this.highlightStats);
    const statValue = this.pickRandom(this.statSamples);
    const statLine = statTemplate.replace('{statValue}', statValue);

    const extraStatTemplate = this.pickRandom(this.highlightStats.filter(line => line !== statTemplate));
    const extraStatValue = this.pickRandom(this.statSamples.filter(value => value !== statValue));
    const extraStatLine = extraStatTemplate.replace('{statValue}', extraStatValue);

    return {
      headline: `${theme} ${hook}`,
      subHeadline: `${tone} em campo`,
      bulletPoints: [statLine, extraStatLine]
    };
  }

  private pickRandom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  openWorkoutSelector(): void {
    const dialogRef = this.dialog.open(WorkoutSelectorComponent, {
      width: '90vw',
      maxWidth: '1000px',
      maxHeight: '90vh',
      data: {
        maxSelections: 10,
        showSyncButton: true
      }
    });

    dialogRef.afterClosed()
      .pipe(
        switchMap(() => this.workoutService.getSelectedActivitiesDetails()),
        take(1)
      )
      .subscribe(activities => {
        this.selectedWorkouts = activities;

        if (activities.length > 0) {
          this.ensureExpanded();
          this.activeAction = 'workout';
        } else if (this.activeAction === 'workout') {
          this.activeAction = null;
        }
      });
  }

  removeWorkout(workout: WorkoutActivity): void {
    this.selectedWorkouts = this.selectedWorkouts.filter(w => w.id !== workout.id);
    this.workoutService.removeActivityFromSelection(workout.id);
  }

  clearSelectedWorkouts(): void {
    this.selectedWorkouts = [];
    this.workoutService.clearActivitySelection();
  }

  applyHighlightTemplate(): void {
    this.ensureHighlightSuggestion();

    if (!this.highlightSuggestion) {
      return;
    }

    const { headline, subHeadline, bulletPoints } = this.highlightSuggestion;
    const template = `\n\n⭐ ${headline}\n${subHeadline}\n${bulletPoints.map(point => `• ${point}`).join('\n')}`;
    this.appendTemplate(template);
  }

  applyStatsTemplate(): void {
    this.appendTemplate('\n\n📊 Estatísticas do treino:\n• Distância: \n• Duração: \n• Ritmo médio: ');
  }

  applyAnalysisTemplate(): void {
    this.appendTemplate('\n\n📈 Análise do Treino:\n\n🎯 Objetivo: \n💪 Pontos fortes: \n🔧 Áreas a melhorar: \n📅 Próximos passos: ');
  }

  applyAchievementTemplate(): void {
    this.appendTemplate('\n\n🏆 Nova conquista alcançada! ');
  }

  applyChallengeTemplate(): void {
    this.appendTemplate('\n\n🎯 Desafio:\n\n📋 Descrição: \n⏰ Prazo: \n🎥 Premiação: \n✅ Status: ');
  }

  applyRouteTemplate(): void {
    this.appendTemplate('\n\n🗺️ Percurso do treino disponível no Strava!');
  }

  private appendTemplate(template: string): void {
    this.ensureExpanded();

    const snippet = template.trim();
    if (this.postContent.includes(snippet)) {
      return;
    }

    if (this.postContent && !this.postContent.endsWith('\n')) {
      this.postContent += '\n';
    }

    this.postContent += template;
  }

  regenerateHighlightSuggestion(): void {
    this.highlightSuggestion = this.generateHighlightSuggestion();
  }

  public getWorkoutTypeName(type: string): string {
    const typeNames: Record<string, string> = {
      'run': 'Corrida',
      'ride': 'Ciclismo',
      'swim': 'Natação',
      'workout': 'Treino',
      'walk': 'Caminhada',
      'hike': 'Trilha',
      'alpineski': 'Esqui Alpino',
      'snowboard': 'Snowboard',
      'kayaking': 'Caiaque'
    };

    return typeNames[type] || type;
  }

  getWorkoutAccent(type?: string | null): string {
    if (!type) {
      return 'var(--color-primary)';
    }

    const accent = this.workoutAccents[type.toLowerCase()];
    return accent ?? 'var(--color-primary)';
  }

  getSelectedAccentType(): string | undefined {
    if (!this.selectedWorkouts.length) {
      return undefined;
    }

    return this.selectedWorkouts[0].type;
  }

  /**
   * TrackBy function para performance
   */
  trackByWorkoutId(index: number, workout: WorkoutActivity): string {
    return workout.id;
  }

  handleRouteAction(): void {
    // Adicionar conteúdo de rota ao post
    const routeText = '\n\n🗺️ Percurso do treino disponível no Strava!';
    this.postContent += routeText;
    if (!this.isExpanded) {
      this.isExpanded = true;
    }
  }

  handleStatsAction(): void {
    // Adicionar placeholder para estatísticas
    const statsText = '\n\n📊 Estatísticas do treino:\n• Distância: \n• Duração: \n• Ritmo médio: ';
    this.postContent += statsText;
    if (!this.isExpanded) {
      this.isExpanded = true;
    }
  }

  handleAnalysisAction(): void {
    // Adicionar estrutura para análise
    const analysisText = '\n\n📈 Análise do Treino:\n\n🎯 Objetivo: \n💪 Pontos fortes: \n🔧 Áreas a melhorar: \n📅 Próximos passos: ';
    this.postContent += analysisText;
    if (!this.isExpanded) {
      this.isExpanded = true;
    }
  }

  handleAchievementAction(): void {
    // Adicionar comemoração de conquista
    const achievementText = '\n\n🏆 Nova conquista alcançada! ';
    this.postContent += achievementText;
    if (!this.isExpanded) {
      this.isExpanded = true;
    }
  }

  handleChallengeAction(): void {
    // Adicionar estrutura de desafio
    const challengeText = '\n\n🎯 Desafio:\n\n📋 Descrição: \n⏰ Prazo: \n🎥 Premiação: \n✅ Status: ';
    this.postContent += challengeText;
    if (!this.isExpanded) {
      this.isExpanded = true;
    }
  }

  handleHighlightAction(): void {
    // Adicionar estrutura para highlight
    const highlightText = '\n\n⭐ Highlight:\n\n🎯 Momento: \n📝 Descrição: \n💭 Impacto: ';
    this.postContent += highlightText;
    if (!this.isExpanded) {
      this.isExpanded = true;
    }
  }

  /**
   * Obter ícone baseado no tipo de atividade
   */
  getWorkoutIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'run': 'directions_run',
      'ride': 'directions_bike',
      'swim': 'pool',
      'workout': 'fitness_center',
      'walk': 'directions_walk',
      'hike': 'hiking',
      'alpineski': 'downhill_skiing',
      'snowboard': 'snowboarding',
      'kayaking': 'kayaking'
    };

    return iconMap[type] || 'fitness_center';
  }
}
