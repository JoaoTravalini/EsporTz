import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from '../../core/services/users.service';
import { HighlightsService } from '../../core/services/highlights.service';
import { TacticalService } from '../../core/services/tactical.service';
import { StatisticsService } from '../../core/services/statistics.service';
import { AuthService } from '../../core/services/auth.service';
import { StravaService } from '../../core/services/strava.service';
import { PostsService } from '../../core/services/posts.service';
import { WorkoutActivitiesService, WorkoutActivity } from '../../core/services/workout-activities.service';
import { WorkoutDetailsDialogComponent } from '../../shared/components/workout-details-dialog/workout-details-dialog.component';
import { User, Highlight, TacticalAnalysis, UserStats } from '../../core/models';
import type { PublicPost } from '../../core/models/post.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  userStats: UserStats | null = null;
  userPosts: PublicPost[] = [];
  userHighlights: Highlight[] = [];
  userAnalyses: TacticalAnalysis[] = [];
  userWorkouts: WorkoutActivity[] = [];
  loading = true;
  postsLoading = true;
  statsLoading = true;
  highlightsLoading = true;
  analysesLoading = true;
  workoutsLoading = true;
  isOwnProfile = false;
  currentUserId: string | null = null;
  activeTab: 'posts' | 'highlights' | 'analyses' | 'stats' | 'workouts' = 'posts';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private postsService: PostsService,
    private highlightsService: HighlightsService,
    private tacticalService: TacticalService,
    private statisticsService: StatisticsService,
    private authService: AuthService,
  private stravaService: StravaService,
  public readonly workoutService: WorkoutActivitiesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.currentUser?.id || null;

    this.route.params.subscribe(params => {
      // Se não houver userId na rota, usa o ID do usuário logado
      const userId = params['userId'] || this.currentUserId;

      if (userId) {
        this.isOwnProfile = userId === this.currentUserId;
        this.loadUserProfile(userId);
        this.loadUserPosts(userId);
        this.loadUserStats(userId);
        this.loadUserHighlights(userId);
        this.loadUserAnalyses(userId);
        this.loadUserWorkouts(userId);
      } else {
        // Se não houver usuário logado, redireciona para login
        this.router.navigate(['/auth/login']);
      }
    });

    // Observar mudanças na conexão com Strava
    let previousConnectionState = false;
    this.stravaService.stravaConnection$.subscribe(connection => {
      const isNowConnected = connection.isConnected;
      
      // Só notificar se mudou de desconectado para conectado
      if (isNowConnected && !previousConnectionState && this.user?.id) {
        console.log('Strava conectado! Atualizando treinos...');
        this.snackBar.open('Conectado ao Strava com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Recarregar treinos após conexão
        this.loadUserWorkouts(this.user.id);
      }
      
      previousConnectionState = isNowConnected;
    });
  }

  loadUserProfile(userId: string): void {
    this.loading = true;
    this.usersService.getUserProfile(userId).subscribe({
      next: (user) => {
        this.user = user;
        console.log('User profile loaded:', user);
        console.log('Followers:', user.followers?.length || 0);
        console.log('Following:', user.following?.length || 0);
        console.log('Stats:', user.stats);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.snackBar.open('Erro ao carregar perfil do usuário', 'Fechar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadUserPosts(userId: string): void {
    this.postsLoading = true;
    this.postsService.getUserPosts(userId).subscribe({
      next: (posts) => {
        this.userPosts = posts;
        console.log('User posts loaded:', posts.length);
        this.postsLoading = false;
      },
      error: (error) => {
        console.error('Error loading user posts:', error);
        this.postsLoading = false;
      }
    });
  }

  loadUserStats(userId: string): void {
    this.statsLoading = true;
    this.statisticsService.getUserStats(userId).subscribe({
      next: (stats) => {
        this.userStats = stats;
        this.statsLoading = false;
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
        this.statsLoading = false;
      }
    });
  }

  loadUserHighlights(userId: string): void {
    this.highlightsLoading = true;
    this.highlightsService.getUserHighlights(userId, 20, 0).subscribe({
      next: (highlights) => {
        this.userHighlights = highlights;
        this.highlightsLoading = false;
      },
      error: (error) => {
        console.error('Error loading user highlights:', error);
        this.highlightsLoading = false;
      }
    });
  }

  loadUserAnalyses(userId: string): void {
    this.analysesLoading = true;
    this.tacticalService.getUserTacticalAnalyses(userId, 20, 0).subscribe({
      next: (analyses) => {
        this.userAnalyses = analyses;
        this.analysesLoading = false;
      },
      error: (error) => {
        console.error('Error loading user analyses:', error);
        this.analysesLoading = false;
      }
    });
  }

  loadUserWorkouts(userId: string): void {
    // Só carregar workouts se estiver conectado ao Strava e autenticado
    if (!this.authService.token) {
      this.workoutsLoading = false;
      return;
    }

    if (!this.isStravaConnected) {
      this.workoutsLoading = false;
      return;
    }

    this.workoutsLoading = true;
    this.workoutService.getUserActivities(20, 0).subscribe({
      next: (response) => {
        this.userWorkouts = response.activities;
        this.workoutsLoading = false;
      },
      error: (error) => {
        console.error('Error loading user workouts:', error);
        this.workoutsLoading = false;
        
        // Se for erro de autenticação, não mostrar erro (será tratado pelo interceptor)
        if (error.status !== 401) {
          this.snackBar.open('Erro ao carregar treinos. Tente novamente.', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  viewHighlight(highlight: Highlight): void {
    this.router.navigate(['/highlights', highlight.id]);
  }

  viewAnalysis(analysis: TacticalAnalysis): void {
    this.router.navigate(['/tactical', analysis.id]);
  }

  viewWorkoutDetails(workout: WorkoutActivity): void {
    this.dialog.open(WorkoutDetailsDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { activity: workout }
    });
  }

  syncWorkouts(): void {
    if (!this.isStravaConnected) {
      const currentPath = this.router.url;
      this.stravaService.connectToStrava(currentPath);
      return;
    }

    this.workoutService.syncStravaActivities(50).subscribe({
      next: (response) => {
        this.snackBar.open(response.message, 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Recarregar atividades após sincronização
        this.loadUserWorkouts(this.user?.id || '');
      },
      error: (error) => {
        console.error('Error syncing workouts:', error);
        this.snackBar.open('Erro ao sincronizar treinos. Tente novamente.', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  editProfile(): void {
    this.router.navigate(['/settings/profile']);
  }

  get userInitials(): string {
    if (!this.user) return '';
    const names = this.user.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  get followerCount(): number {
    return this.user?.followers?.length || 0;
  }

  get followingCount(): number {
    return this.user?.following?.length || 0;
  }

  get highlightsCount(): number {
    return this.user?.stats?.highlightsCreated || 0;
  }

  get analysesCount(): number {
    return this.user?.stats?.analysesCreated || 0;
  }

  get totalViews(): number {
    return this.user?.stats?.totalViews || 0;
  }

  get totalLikes(): number {
    return this.user?.stats?.totalLikes || 0;
  }

  get workoutsCount(): number {
    return this.userWorkouts.length;
  }

  get isStravaConnected(): boolean {
    return this.stravaService.isConnected;
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

  /**
   * Obter nome formatado do tipo de atividade
   */
  getWorkoutTypeName(type: string): string {
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

  connectStrava(): void {
    const currentPath = this.router.url;
    this.stravaService.connectToStrava(currentPath);
  }

  disconnectStrava(): void {
    if (confirm('Tem certeza que deseja desconectar sua conta do Strava?')) {
      this.stravaService.disconnect();
      this.snackBar.open('Conta do Strava desconectada com sucesso', 'Fechar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  /**
   * Obter path SVG para ícones de workout
   */
  _getWorkoutIconPath(type: string): string {
    const iconPaths: Record<string, string> = {
      'run': 'M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7',
      'ride': 'M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.9 8.6c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 15v5h2v-6.2l-2.2-2.3z',
      'swim': 'M21 12c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-11 0c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm0-6c0 1.66-1.34 3-3 3S4 7.66 4 6 5.34 3 7 3s3 1.34 3 3zm11 0c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z',
      'workout': 'M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 2 10.57 8.43 17 12 20.57z',
      'walk': 'M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7',
      'hike': 'M14.5 4.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM15 8l-3.5 7-3.5-7H2v2h5.1L10 18l-2 4h2.5l1.5-3 1.5 3H16l-2-4 2.9-8H15z',
      'alpineski': 'M14 2l-2 2 2 2 2-2-2-2zm7 7c0-.55-.45-1-1-1h-3c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1zm-6.5 5.5L11 12l-3.5 2.5L4 11l2 2 1.5 1.5L4 18l3 3 2.5-2.5L12 21l3.5-2.5L19 20l2-2-4.5-3.5z',
      'snowboard': 'M2 17h20l-10-15L2 17zm10-11l6 9H6l6-9z',
      'kayaking': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
    };

    return iconPaths[type] || iconPaths['workout'];
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

