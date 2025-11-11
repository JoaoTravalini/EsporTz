import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSelectionListChange } from '@angular/material/list';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { WorkoutActivitiesService, WorkoutActivity } from '../../../core/services/workout-activities.service';
import { WorkoutDetailsDialogComponent } from '../workout-details-dialog/workout-details-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-workout-selector',
  templateUrl: './workout-selector.component.html',
  styleUrls: ['./workout-selector.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule
  ]
})
export class WorkoutSelectorComponent implements OnInit, OnDestroy {
  @Input() maxSelections: number = 10;
  @Input() showSyncButton: boolean = true;
  @Output() selectionChange = new EventEmitter<WorkoutActivity[]>();

  activities: WorkoutActivity[] = [];
  dataSource = new MatTableDataSource<WorkoutActivity>();
  selectedActivities: WorkoutActivity[] = [];
  isLoading = false;
  isSyncing = false;
  errorMessage = '';
  private readonly accentMap: Record<string, string> = {
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

  private destroy$ = new Subject<void>();

  // Colunas da tabela
  displayedColumns: string[] = [
    'select',
    'name',
    'type',
    'date',
    'distance',
    'time',
    'speed',
    'elevation',
    'actions'
  ];

  constructor(
    public workoutService: WorkoutActivitiesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserActivities();

    // Escutar mudanças na seleção do serviço
    combineLatest([
      this.workoutService.selectedActivities$Observable,
      this.workoutService.getUserActivities()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([selectedIds, response]) => {
      this.activities = response.activities;
      this.updateSelectedActivities(selectedIds);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carregar atividades do usuário
   */
  loadUserActivities(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.workoutService.getUserActivities(30, 0).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.activities = response.activities;
        this.dataSource.data = this.activities;
        this.updateSelectedActivities(this.workoutService.getSelectedActivities());
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading activities:', error);
        this.errorMessage = 'Erro ao carregar atividades. Tente sincronizar com o Strava.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Sincronizar atividades com Strava
   */
  syncWithStrava(): void {
    this.isSyncing = true;
    this.errorMessage = '';

    this.workoutService.syncStravaActivities(50).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('Sync result:', response);
        this.isSyncing = false;
        // Recarregar atividades após sincronização
        this.loadUserActivities();
      },
      error: (error) => {
        console.error('Error syncing with Strava:', error);
        this.errorMessage = 'Erro ao sincronizar com Strava. Verifique sua conexão.';
        this.isSyncing = false;
      }
    });
  }

  /**
   * Lidar com mudança na seleção de atividades
   */
  onSelectionChange(event: MatSelectionListChange): void {
    const selectedIds = event.options.map(option => option.value);

    // Atualizar serviço
    this.workoutService.clearActivitySelection();
    selectedIds.forEach(id => this.workoutService.addActivityToSelection(id));

    this.updateSelectedActivities(selectedIds);
  }

  /**
   * Atualizar atividades selecionadas com base nos IDs
   */
  private updateSelectedActivities(selectedIds: string[]): void {
    this.selectedActivities = this.activities.filter(activity =>
      selectedIds.includes(activity.id)
    );

    this.selectionChange.emit(this.selectedActivities);
  }

  get selectedActivitiesSummary(): string {
    if (this.selectedActivities.length === 0) {
      return '';
    }

    if (this.selectedActivities.length === 1) {
      return this.selectedActivities[0].name;
    }

    const types = [...new Set(this.selectedActivities.map(activity => activity.type))];
    if (types.length === 1) {
      return `${this.selectedActivities.length} ${this.getActivityTypeName(types[0]).toLowerCase()}(s)`;
    }

    return `${this.selectedActivities.length} treinos`;
  }

  /**
   * Alternar seleção de atividade
   */
  toggleActivitySelection(activity: WorkoutActivity): void {
    if (this.workoutService.isActivitySelected(activity.id)) {
      this.workoutService.removeActivityFromSelection(activity.id);
    } else {
      if (this.selectedActivities.length >= this.maxSelections) {
        this.errorMessage = `Máximo de ${this.maxSelections} atividades permitidas`;
        setTimeout(() => this.errorMessage = '', 3000);
        return;
      }
      this.workoutService.addActivityToSelection(activity.id);
    }
  }

  /**
   * Abrir diálogo com detalhes da atividade
   */
  showActivityDetails(activity: WorkoutActivity): void {
    this.dialog.open(WorkoutDetailsDialogComponent, {
      width: '520px',
      maxWidth: '85vw',
      data: { activity }
    });
  }

  /**
   * Aplicar filtros na lista
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();

    if (!filterValue) {
      this.dataSource.data = this.activities;
      return;
    }

    this.dataSource.data = this.activities.filter(activity =>
      activity.name.toLowerCase().includes(filterValue) ||
      activity.type.toLowerCase().includes(filterValue) ||
      (activity.description && activity.description.toLowerCase().includes(filterValue))
    );
  }

  /**
   * TrackBy function para performance
   */
  trackByActivityId(index: number, activity: WorkoutActivity): string {
    return activity.id;
  }

  /**
   * Obter ícone baseado no tipo de atividade
   */
  getActivityIcon(type: string): string {
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

  /**
   * Obter nome formatado do tipo de atividade
   */
  getActivityTypeName(type: string): string {
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

  /**
   * Verificar se atividade está selecionada
   */
  isActivitySelected(activity: WorkoutActivity): boolean {
    return this.workoutService.isActivitySelected(activity.id);
  }

  /**
   * Limpar seleção
   */
  clearSelection(): void {
    this.workoutService.clearActivitySelection();
    this.selectedActivities = [];
    this.selectionChange.emit([]);
  }

  /**
   * Verificar se pode selecionar mais atividades
   */
  canSelectMore(): boolean {
    return this.selectedActivities.length < this.maxSelections;
  }

  getAccentColor(type?: string | null): string {
    if (!type) {
      return 'var(--color-primary)';
    }

    const accent = this.accentMap[type.toLowerCase()];
    return accent ?? 'var(--color-primary)';
  }

  getHeaderAccentType(): string | undefined {
    if (this.selectedActivities.length > 0) {
      return this.selectedActivities[0]?.type;
    }

    if (this.activities.length > 0) {
      return this.activities[0]?.type;
    }

    return undefined;
  }
}