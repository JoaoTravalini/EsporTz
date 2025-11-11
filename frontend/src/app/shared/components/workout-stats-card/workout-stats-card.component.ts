import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WorkoutActivity, WorkoutActivitiesService } from '../../../core/services/workout-activities.service';

type WorkoutTheme = {
  accent: string;
  accentSoft: string;
  iconGradient: string;
  cardGradient: string;
  statBackground: string;
};

type WorkoutStat = {
  key: string;
  label: string;
  value: string;
  icon: string;
  accent?: string;
};

@Component({
  selector: 'app-workout-stats-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="workout-stats-card" *ngIf="workout" [ngStyle]="getThemeStyles(workout.type)">
      <div class="workout-header">
        <div class="workout-icon">
          <mat-icon>{{ getWorkoutIcon(workout.type) }}</mat-icon>
        </div>

        <div class="workout-info">
          <h3 class="workout-title" matTooltip="{{ workout.name }}">{{ workout.name }}</h3>
          <p class="workout-meta">
            <span class="workout-type">{{ getWorkoutTypeName(workout.type) }}</span>
            <span class="separator">•</span>
            <span>{{ formatDate(workout.startDate) }}</span>
            <span *ngIf="workout.movingTime" class="separator">•</span>
            <span *ngIf="workout.movingTime">{{ workoutService.formatDuration(workout.movingTime) }}</span>
          </p>
        </div>

        <div class="workout-effort" *ngIf="getEffortLabel(workout) as effort">
          <span class="effort-pill">{{ effort }}</span>
        </div>
      </div>

      <div class="stat-grid" *ngIf="statsList.length > 0">
        <div
          class="stat-item"
          *ngFor="let stat of statsList; trackBy: trackByStat"
          [ngStyle]="{'--stat-accent': stat.accent ?? 'var(--accent-color)'}"
        >
          <div class="stat-icon">
            <mat-icon>{{ stat.icon }}</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value">{{ stat.value }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .workout-stats-card {
      background: var(--card-gradient, linear-gradient(135deg, rgba(8, 30, 52, 0.95) 0%, rgba(4, 18, 34, 0.95) 100%));
      border: 1px solid rgba(29, 155, 240, 0.16);
      border-radius: 16px;
      padding: 1.1rem 1.25rem;
      margin-top: 0.9rem;
      box-shadow: 0 22px 46px -32px rgba(5, 22, 40, 0.82);
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

      &:hover {
        transform: translateY(-3px);
        border-color: var(--accent-color, #1d9bf0);
        box-shadow: 0 26px 44px -30px rgba(29, 155, 240, 0.65);
      }
    }

    .workout-header {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-bottom: 1.15rem;
      flex-wrap: wrap;
    }

    .workout-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 14px;
  background: var(--icon-gradient, linear-gradient(135deg, #1d9bf0 0%, #006bbf 100%));
  color: #ffffff;
      box-shadow: 0 16px 36px -22px rgba(29, 155, 240, 0.9);

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .workout-info {
      flex: 1 1 220px;
      min-width: 0;
    }

    .workout-title {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .workout-meta {
      margin: 0.35rem 0 0;
      font-size: 0.83rem;
      color: rgba(183, 209, 235, 0.82);
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
    }

    .separator {
      color: rgba(183, 209, 235, 0.45);
    }

    .workout-effort {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex: 0 0 auto;
    }

    .effort-pill {
      padding: 0.28rem 0.7rem;
      border-radius: 999px;
      background: var(--accent-soft, rgba(29, 155, 240, 0.2));
      color: var(--accent-color, #1d9bf0);
      font-size: 0.74rem;
      font-weight: 600;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 0.9rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 14px;
      background: var(--stat-background, rgba(9, 38, 66, 0.72));
      border: 1px solid rgba(29, 155, 240, 0.16);
      transition: transform 0.15s ease, border-color 0.15s ease;

      &:hover {
        transform: translateY(-2px);
        border-color: var(--stat-accent, var(--accent-color));
      }
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: rgba(29, 155, 240, 0.16);
      color: var(--stat-accent, var(--accent-color, #1d9bf0));
      box-shadow: inset 0 0 0 1px rgba(29, 155, 240, 0.18);

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 0.12rem;
    }

    .stat-label {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.55px;
      font-weight: 600;
      color: rgba(183, 209, 235, 0.75);
    }

    .stat-value {
      font-size: 1.08rem;
      font-weight: 700;
      color: rgba(230, 244, 255, 0.96);
    }

    @media (max-width: 600px) {
      .workout-stats-card {
        padding: 1rem;
      }

      .stat-grid {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      }
    }
  `]
})
export class WorkoutStatsCardComponent {
  @Input() workout!: WorkoutActivity;

  private readonly themes: Record<string, WorkoutTheme> = {
    run: {
      accent: '#1d9bf0',
      accentSoft: 'rgba(29, 155, 240, 0.18)',
      iconGradient: 'linear-gradient(140deg, #1d9bf0 0%, #006bbf 95%)',
      cardGradient: 'linear-gradient(135deg, rgba(29, 155, 240, 0.16) 0%, rgba(10, 16, 24, 0.96) 92%)',
  statBackground: 'rgba(29, 155, 240, 0.16)'
    },
    ride: {
      accent: '#1780d6',
      accentSoft: 'rgba(23, 128, 214, 0.2)',
      iconGradient: 'linear-gradient(140deg, #1780d6 0%, #0f5ca7 95%)',
      cardGradient: 'linear-gradient(135deg, rgba(23, 128, 214, 0.16) 0%, rgba(8, 16, 26, 0.95) 92%)',
  statBackground: 'rgba(23, 128, 214, 0.18)'
    },
    swim: {
      accent: '#16b0ff',
      accentSoft: 'rgba(22, 176, 255, 0.22)',
      iconGradient: 'linear-gradient(140deg, #16b0ff 0%, #0061ff 95%)',
      cardGradient: 'linear-gradient(135deg, rgba(22, 176, 255, 0.18) 0%, rgba(6, 18, 30, 0.94) 92%)',
  statBackground: 'rgba(22, 176, 255, 0.18)'
    },
    walk: {
      accent: '#45c1ff',
      accentSoft: 'rgba(69, 193, 255, 0.2)',
      iconGradient: 'linear-gradient(140deg, #45c1ff 0%, #0d7add 95%)',
      cardGradient: 'linear-gradient(135deg, rgba(69, 193, 255, 0.16) 0%, rgba(8, 18, 27, 0.95) 92%)',
  statBackground: 'rgba(69, 193, 255, 0.18)'
    },
    hike: {
      accent: '#4ea6ff',
      accentSoft: 'rgba(78, 166, 255, 0.22)',
      iconGradient: 'linear-gradient(140deg, #4ea6ff 0%, #1c6fd8 95%)',
      cardGradient: 'linear-gradient(135deg, rgba(78, 166, 255, 0.18) 0%, rgba(6, 18, 32, 0.93) 92%)',
  statBackground: 'rgba(78, 166, 255, 0.18)'
    }
  };

  private readonly fallbackTheme: WorkoutTheme = {
    accent: '#1d9bf0',
    accentSoft: 'rgba(29, 155, 240, 0.2)',
    iconGradient: 'linear-gradient(140deg, #1d9bf0 0%, #006bbf 100%)',
    cardGradient: 'linear-gradient(135deg, rgba(29, 155, 240, 0.18) 0%, rgba(7, 12, 20, 0.95) 92%)',
    statBackground: 'rgba(29, 155, 240, 0.2)'
  };

  constructor(public readonly workoutService: WorkoutActivitiesService) {}

  getWorkoutIcon(type: string): string {
    const key = (type ?? '').toLowerCase();
    const iconMap: Record<string, string> = {
      run: 'directions_run',
      ride: 'directions_bike',
      swim: 'pool',
      workout: 'fitness_center',
      walk: 'directions_walk',
      hike: 'hiking',
      alpineski: 'downhill_skiing',
      backcountryski: 'downhill_skiing',
      nordicski: 'downhill_skiing',
      snowboard: 'snowboarding',
      kayaking: 'kayaking'
    };
    return iconMap[key] ?? 'fitness_center';
  }

  getWorkoutTypeName(type: string): string {
    const key = (type ?? '').toLowerCase();
    const typeNames: Record<string, string> = {
      run: 'Corrida',
      ride: 'Ciclismo',
      swim: 'Natação',
      workout: 'Treino',
      walk: 'Caminhada',
      hike: 'Trilha',
      alpineski: 'Esqui Alpino',
      backcountryski: 'Esqui Backcountry',
      nordicski: 'Ski Nórdico',
      snowboard: 'Snowboard',
      kayaking: 'Caiaque'
    };
    return typeNames[key] ?? type;
  }

  get statsList(): WorkoutStat[] {
    if (!this.workout) {
      return [];
    }

    const stats: WorkoutStat[] = [];
    const distance = this.workoutService.formatDistance(this.workout.distance);
    if (distance) {
      stats.push({ key: 'distance', label: 'Distância', value: distance, icon: 'straighten' });
    }

    const duration = this.workoutService.formatDuration(this.workout.movingTime);
    if (duration) {
      stats.push({ key: 'time', label: 'Tempo', value: duration, icon: 'schedule' });
    }

    const pace = this.getPace();
    if (pace) {
      stats.push({ key: 'pace', label: 'Ritmo', value: pace, icon: 'timer', accent: '#45c1ff' });
    }

    const speed = this.workoutService.formatSpeed(this.workout.averageSpeed);
    if (speed) {
      stats.push({ key: 'speed', label: 'Vel. Média', value: speed, icon: 'speed' });
    }

    const elevation = this.workoutService.formatElevation(this.workout.elevationGain);
    if (elevation) {
      stats.push({ key: 'elevation', label: 'Elevação', value: elevation, icon: 'terrain' });
    }

    const heartRate = this.toNumber(this.workout.averageHeartRate);
    if (heartRate) {
      stats.push({ key: 'heart-rate', label: 'FC Média', value: `${heartRate.toFixed(0)} bpm`, icon: 'favorite', accent: '#ff5c8d' });
    }

    const power = this.toNumber(this.workout.averagePower);
    if (power) {
      stats.push({ key: 'power', label: 'Potência', value: `${Math.round(power)} W`, icon: 'bolt', accent: '#1780d6' });
    }

    return stats;
  }

  trackByStat(_: number, stat: WorkoutStat): string {
    return stat.key;
  }

  formatDate(dateString: string): string {
    return this.workoutService.formatDate(dateString);
  }

  getEffortLabel(workout: WorkoutActivity): string | null {
    const distanceMeters = this.toNumber(workout.distance);
    const movingTime = this.toNumber(workout.movingTime);

    if (!distanceMeters || !movingTime) {
      return null;
    }

    const speedKmh = (distanceMeters / 1000) / (movingTime / 3600);

    if (speedKmh >= 30) {
      return 'Intenso';
    }

    if (speedKmh >= 18) {
      return 'Forte';
    }

    if (speedKmh >= 10) {
      return 'Constante';
    }

    return 'Leve';
  }

  getThemeStyles(type: string): Record<string, string> {
    const key = (type ?? '').toLowerCase();
    const theme = this.themes[key] ?? this.fallbackTheme;
    return {
      '--accent-color': theme.accent,
      '--accent-soft': theme.accentSoft,
      '--icon-gradient': theme.iconGradient,
      '--card-gradient': theme.cardGradient,
      '--stat-background': theme.statBackground
    };
  }

  private getPace(): string | null {
    const type = (this.workout?.type ?? '').toLowerCase();
    const supportsPace = ['run', 'walk', 'hike'].includes(type);
    const distance = this.toNumber(this.workout?.distance);
    const movingTime = this.toNumber(this.workout?.movingTime);

    if (!supportsPace || !distance || distance <= 0 || !movingTime || movingTime <= 0) {
      return null;
    }

    const paceSeconds = movingTime / (distance / 1000);
    if (!isFinite(paceSeconds) || paceSeconds <= 0) {
      return null;
    }

    const minutes = Math.floor(paceSeconds / 60);
    const seconds = Math.round(paceSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
  }

  private toNumber(value: unknown): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }
}
