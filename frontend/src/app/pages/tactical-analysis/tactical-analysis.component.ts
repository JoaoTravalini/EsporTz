import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TacticalService } from '../../core/services/tactical.service';
import { SportsService } from '../../core/services/sports.service';
import { TacticalAnalysis, TacticalAnalysisInput, Sport, User } from '../../core/models';

@Component({
  selector: 'app-tactical-analysis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="tactical-container">
      <div class="header">
        <h1>Análises Táticas</h1>
        <button mat-raised-button color="primary" (click)="openCreateAnalysis()">
          <mat-icon>add</mat-icon>
          Nova Análise
        </button>
      </div>

      <mat-tab-group>
        <mat-tab label="Todas Análises">
          <div class="analysis-grid">
            <div class="loading" *ngIf="loading">
              <mat-progress-bar mode="indeterminate"></mat-progress-bar>
              <p>Carregando análises...</p>
            </div>

            <div class="analysis-cards" *ngIf="!loading">
              <mat-card class="analysis-card" *ngFor="let analysis of analyses">
                <mat-card-header>
                  <div mat-card-avatar>
                    <img [src]="analysis.author.imgURL || '/assets/default-avatar.png'"
                         [alt]="analysis.author.name">
                  </div>
                  <mat-card-title>{{ analysis.title }}</mat-card-title>
                  <mat-card-subtitle>{{ analysis.author.name }} • {{ analysis.sport.name }}</mat-card-subtitle>
                </mat-card-header>

                <mat-card-content>
                  <p class="analysis-excerpt">{{ analysis.content | slice:0:200 }}{{ analysis.content.length > 200 ? '...' : '' }}</p>

                  <div class="tactical-info" *ngIf="analysis.formation">
                    <div class="formation-info">
                      <strong>Formações:</strong>
                      <span>Home: {{ analysis.formation.home.formation.join('-') }}</span>
                      <span>Away: {{ analysis.formation.away.formation.join('-') }}</span>
                    </div>
                  </div>

                  <div class="analysis-stats">
                    <span class="stat">
                      <mat-icon>visibility</mat-icon>
                      {{ analysis.views }}
                    </span>
                    <span class="stat">
                      <mat-icon>favorite</mat-icon>
                      {{ analysis.likes }}
                    </span>
                    <span class="stat">
                      <mat-icon>comment</mat-icon>
                      {{ analysis.comments.length || 0 }}
                    </span>
                    <span class="verified-badge" *ngIf="analysis.isVerified">
                      <mat-icon>verified</mat-icon>
                      Verificado
                    </span>
                  </div>

                  <div class="ai-insights" *ngIf="analysis.aiInsights">
                    <mat-icon>psychology</mat-icon>
                    <div class="insights-content" [innerHTML]="analysis.aiInsights"></div>
                  </div>
                </mat-card-content>

                <mat-card-actions>
                  <button mat-button (click)="toggleLike(analysis)">
                    <mat-icon>{{ isLikedByUser(analysis) ? 'favorite' : 'favorite_border' }}</mat-icon>
                    Curtir
                  </button>
                  <button mat-button (click)="viewAnalysis(analysis)">
                    <mat-icon>visibility</mat-icon>
                    Ver Detalhes
                  </button>
                  <button mat-button *ngIf="isAuthor(analysis)" (click)="editAnalysis(analysis)">
                    <mat-icon>edit</mat-icon>
                    Editar
                  </button>
                  <button mat-button (click)="exportAnalysis(analysis)">
                    <mat-icon>download</mat-icon>
                    Exportar
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>

            <div class="no-results" *ngIf="!loading && analyses.length === 0">
              <mat-icon>trending_up</mat-icon>
              <p>Nenhuma análise tática encontrada</p>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Análises Verificadas">
          <div class="analysis-grid">
            <div class="loading" *ngIf="verifiedLoading">
              <mat-progress-bar mode="indeterminate"></mat-progress-bar>
            </div>

            <div class="analysis-cards" *ngIf="!verifiedLoading">
              <mat-card class="analysis-card verified" *ngFor="let analysis of verifiedAnalyses">
                <!-- Similar structure but with verified styling -->
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Criar Análise">
          <div class="create-analysis-form">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Nova Análise Tática</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form class="analysis-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Título</mat-label>
                    <input matInput [(ngModel)]="newAnalysis.title" name="title" required>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Esporte</mat-label>
                    <mat-select [(ngModel)]="newAnalysis.sportId" name="sportId" required>
                      <mat-option *ngFor="let sport of sports" [value]="sport.id">
                        {{ sport.name }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Análise</mat-label>
                    <textarea matInput [(ngModel)]="newAnalysis.content" name="content" rows="6" required></textarea>
                  </mat-form-field>

                  <div class="formation-section">
                    <h3>Formações</h3>
                    <div class="formation-inputs">
                      <mat-form-field appearance="outline">
                        <mat-label>Formação Home (ex: 4-3-3)</mat-label>
                        <input matInput [(ngModel)]="homeFormationString" name="homeFormation">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Formação Away (ex: 4-4-2)</mat-label>
                        <input matInput [(ngModel)]="awayFormationString" name="awayFormation">
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="form-actions">
                    <button mat-raised-button color="primary" (click)="createAnalysis()" [disabled]="!isFormValid()">
                      <mat-icon>save</mat-icon>
                      Criar Análise
                    </button>
                    <button mat-button (click)="resetForm()">
                      <mat-icon>clear</mat-icon>
                      Limpar
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .tactical-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .analysis-grid {
      min-height: 400px;
    }

    .loading {
      text-align: center;
      padding: 40px;
    }

    .analysis-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
    }

    .analysis-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .analysis-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .analysis-card.verified {
      border: 2px solid #2196f3;
    }

    .analysis-excerpt {
      color: #666;
      line-height: 1.5;
      margin-bottom: 15px;
    }

    .tactical-info {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
    }

    .formation-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-size: 14px;
    }

    .analysis-stats {
      display: flex;
      gap: 15px;
      margin-top: 15px;
      font-size: 14px;
      color: #666;
      align-items: center;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .stat mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .verified-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #2196f3;
      font-weight: 500;
    }

    .ai-insights {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
    }

    .ai-insights mat-icon {
      vertical-align: middle;
      margin-right: 8px;
    }

    .insights-content {
      display: inline-block;
    }

    .create-analysis-form {
      max-width: 800px;
    }

    .analysis-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .full-width {
      width: 100%;
    }

    .formation-section {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      background: #fafafa;
    }

    .formation-section h3 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .formation-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .no-results {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .no-results mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 10px;
    }
  `]
})
export class TacticalAnalysisComponent implements OnInit {
  analyses: TacticalAnalysis[] = [];
  verifiedAnalyses: TacticalAnalysis[] = [];
  sports: Sport[] = [];
  loading = false;
  verifiedLoading = false;
  currentUserId: string | null = null;

  newAnalysis: Partial<TacticalAnalysisInput> = {};
  homeFormationString = '';
  awayFormationString = '';

  constructor(
    private tacticalService: TacticalService,
    private sportsService: SportsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAnalyses();
    this.loadVerifiedAnalyses();
    this.loadSports();
    this.currentUserId = localStorage.getItem('userId');
  }

  loadAnalyses(): void {
    this.loading = true;
    this.tacticalService.getTacticalAnalyses().subscribe({
      next: (response) => {
        this.analyses = response.analyses;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar análises', 'Fechar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadVerifiedAnalyses(): void {
    this.verifiedLoading = true;
    this.tacticalService.getTacticalAnalyses(undefined, undefined, true).subscribe({
      next: (response) => {
        this.verifiedAnalyses = response.analyses;
        this.verifiedLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar análises verificadas', 'Fechar', { duration: 3000 });
        this.verifiedLoading = false;
      }
    });
  }

  loadSports(): void {
    this.sportsService.getSports().subscribe({
      next: (sports) => {
        this.sports = sports;
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar esportes', 'Fechar', { duration: 3000 });
      }
    });
  }

  toggleLike(analysis: TacticalAnalysis): void {
    if (!this.currentUserId) {
      this.snackBar.open('Faça login para curtir análises', 'Fechar', { duration: 3000 });
      return;
    }

    this.tacticalService.toggleLikeAnalysis(analysis.id).subscribe({
      next: (response) => {
        analysis.likes = response.likes;
        if (response.liked) {
          analysis.likedBy?.push({ id: this.currentUserId!, name: '' });
        } else {
          analysis.likedBy = analysis.likedBy?.filter(user => user.id !== this.currentUserId);
        }
      },
      error: (error) => {
        this.snackBar.open('Erro ao curtir análise', 'Fechar', { duration: 3000 });
      }
    });
  }

  isLikedByUser(analysis: TacticalAnalysis): boolean {
    if (!this.currentUserId) return false;
    return analysis.likedBy?.some(user => user.id === this.currentUserId) || false;
  }

  viewAnalysis(analysis: TacticalAnalysis): void {
    console.log('View analysis:', analysis);
  }

  editAnalysis(analysis: TacticalAnalysis): void {
    console.log('Edit analysis:', analysis);
  }

  exportAnalysis(analysis: TacticalAnalysis): void {
    this.tacticalService.exportAnalysis(analysis.id, 'pdf').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analysis-${analysis.title}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.snackBar.open('Erro ao exportar análise', 'Fechar', { duration: 3000 });
      }
    });
  }

  openCreateAnalysis(): void {
    // Switch to create tab
    console.log('Open create analysis');
  }

  createAnalysis(): void {
    if (!this.isFormValid()) return;

    const formationData = {
      home: {
        formation: this.homeFormationString.split('-'),
        positions: []
      },
      away: {
        formation: this.awayFormationString.split('-'),
        positions: []
      }
    };

    const analysisData: TacticalAnalysisInput = {
      title: this.newAnalysis.title!,
      content: this.newAnalysis.content!,
      sportId: this.newAnalysis.sportId!,
      formation: formationData,
      isPublic: true
    };

    this.tacticalService.createTacticalAnalysis(analysisData).subscribe({
      next: (analysis) => {
        this.analyses.unshift(analysis);
        this.snackBar.open('Análise criada com sucesso!', 'Fechar', { duration: 3000 });
        this.resetForm();
      },
      error: (error) => {
        this.snackBar.open('Erro ao criar análise', 'Fechar', { duration: 3000 });
      }
    });
  }

  resetForm(): void {
    this.newAnalysis = {};
    this.homeFormationString = '';
    this.awayFormationString = '';
  }

  isFormValid(): boolean {
    return !!(this.newAnalysis.title &&
             this.newAnalysis.content &&
             this.newAnalysis.sportId);
  }

  isAuthor(analysis: TacticalAnalysis): boolean {
    return analysis.author.id === this.currentUserId;
  }
}