import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WorkoutActivitiesService, WorkoutActivity } from '../../../core/services/workout-activities.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

export interface WorkoutDetailsDialogData {
  activity: WorkoutActivity;
}

@Component({
  selector: 'app-workout-details-dialog',
  templateUrl: './workout-details-dialog.component.html',
  styleUrls: ['./workout-details-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule]
})
export class WorkoutDetailsDialogComponent {
  readonly Math = Math;

  constructor(
    public dialogRef: MatDialogRef<WorkoutDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WorkoutDetailsDialogData,
    public workoutService: WorkoutActivitiesService
  ) {}

  onClose(): void {
    this.dialogRef.close();
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
   * Formatar data completa
   */
  formatDate(dateString?: string): string {
    if (!dateString) {
      return '';
    }

    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Calcular ritmo (min/km) para corridas
   */
  calculatePace(activity: WorkoutActivity): string {
    if (activity.type !== 'run' || !activity.distance || !activity.movingTime) {
      return '';
    }

    const distanceKm = activity.distance / 1000;
    const timeMinutes = activity.movingTime / 60;
    const paceMinutes = timeMinutes / distanceKm;

    const minutes = Math.floor(paceMinutes);
    const seconds = Math.round((paceMinutes - minutes) * 60);

    return `${minutes}'${seconds.toString().padStart(2, '0')}" /km`;
  }

  /**
   * Calcular calorias estimadas (aproximação simples)
   */
  estimateCalories(activity: WorkoutActivity): number {
    if (!activity.movingTime) return 0;

    const minutes = activity.movingTime / 60;
    let caloriesPerMinute = 8; // base

    switch (activity.type) {
      case 'run':
        caloriesPerMinute = 12;
        break;
      case 'ride':
        caloriesPerMinute = 10;
        break;
      case 'swim':
        caloriesPerMinute = 14;
        break;
      case 'hike':
        caloriesPerMinute = 9;
        break;
      case 'walk':
        caloriesPerMinute = 6;
        break;
      default:
        caloriesPerMinute = 8;
    }

    // Ajustar pela intensidade (velocidade média se disponível)
    if (activity.averageSpeed && activity.type === 'run') {
      if (activity.averageSpeed > 3.5) { // > 12.6 km/h
        caloriesPerMinute *= 1.3;
      } else if (activity.averageSpeed > 2.8) { // > 10 km/h
        caloriesPerMinute *= 1.15;
      }
    }

    return Math.round(minutes * caloriesPerMinute);
  }

  /**
   * Determinar nível de esforço baseado no ritmo ou frequência cardíaca
   */
  getEffortLevel(activity: WorkoutActivity): { label: string; color: string } {
    // Baseado na frequência cardíaca se disponível
    if (activity.averageHeartRate && activity.maxHeartRate) {
      const hrPercentage = (activity.averageHeartRate / activity.maxHeartRate) * 100;

      if (hrPercentage >= 85) {
        return { label: 'Muito Intenso', color: '#f44336' };
      } else if (hrPercentage >= 75) {
        return { label: 'Intenso', color: '#ff9800' };
      } else if (hrPercentage >= 65) {
        return { label: 'Moderado', color: '#4caf50' };
      } else {
        return { label: 'Leve', color: '#2196f3' };
      }
    }

    // Baseado no ritmo para corridas
    if (activity.type === 'run' && activity.averageSpeed) {
      if (activity.averageSpeed > 3.5) {
        return { label: 'Muito Intenso', color: '#f44336' };
      } else if (activity.averageSpeed > 2.8) {
        return { label: 'Intenso', color: '#ff9800' };
      } else if (activity.averageSpeed > 2.2) {
        return { label: 'Moderado', color: '#4caf50' };
      } else {
        return { label: 'Leve', color: '#2196f3' };
      }
    }

    return { label: 'Moderado', color: '#4caf50' };
  }
}