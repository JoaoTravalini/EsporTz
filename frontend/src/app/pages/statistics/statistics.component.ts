import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StatisticsService } from '../../core/services/statistics.service';
import { PlatformStats, TrendingContent, User } from '../../core/models';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  template: `
    <div class="statistics-container">
      <div class="header">
        <h1>Estatísticas e Analytics</h1>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="period-selector">
            <mat-label>Período</mat-label>
            <mat-select [(ngModel)]="selectedPeriod" (selectionChange)="loadPlatformStats()">
              <mat-option value="7d">Últimos 7 dias</mat-option>
              <mat-option value="30d">Últimos 30 dias</mat-option>
              <mat-option value="90d">Últimos 90 dias</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="exportStats()">
            <mat-icon>download</mat-icon>
            Exportar
          </button>
        </div>
      </div>

      <mat-tab-group>
        <mat-tab label="Visão Geral">
          <div class="overview-section">
            <div class="loading" *ngIf="platformLoading">
              <mat-progress-bar mode="indeterminate"></mat-progress-bar>
              <p>Carregando estatísticas...</p>
            </div>

            <div class="overview-content" *ngIf="!platformLoading && platformStats">
              <!-- Metric Cards -->
              <div class="metrics-grid">
                <mat-card class="metric-card">
                  <mat-card-content>
                    <div class="metric-icon">
                      <mat-icon>people</mat-icon>
                    </div>
                    <div class="metric-data">
                      <h2>{{ platformStats.overview.totalUsers.toLocaleString() }}</h2>
                      <p>Usuários Ativos</p>
                      <div class="metric-trend positive">
                        <mat-icon>trending_up</mat-icon>
                        +{{ platformStats.recentActivity.newUsers }} novos
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="metric-card">
                  <mat-card-content>
                    <div class="metric-icon">
                      <mat-icon>video_library</mat-icon>
                    </div>
                    <div class="metric-data">
                      <h2>{{ platformStats.overview.totalHighlights.toLocaleString() }}</h2>
                      <p>Destaques</p>
                      <div class="metric-trend positive">
                        <mat-icon>trending_up</mat-icon>
                        +{{ platformStats.recentActivity.newHighlights }} novos
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="metric-card">
                  <mat-card-content>
                    <div class="metric-icon">
                      <mat-icon>trending_up</mat-icon>
                    </div>
                    <div class="metric-data">
                      <h2>{{ platformStats.overview.totalAnalyses.toLocaleString() }}</h2>
                      <p>Análises Táticas</p>
                      <div class="metric-trend positive">
                        <mat-icon>trending_up</mat-icon>
                        +{{ platformStats.recentActivity.newAnalyses }} novas
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="metric-card">
                  <mat-card-content>
                    <div class="metric-icon">
                      <mat-icon>sports_soccer</mat-icon>
                    </div>
                    <div class="metric-data">
                      <h2>{{ platformStats.overview.totalSports }}</h2>
                      <p>Esportes</p>
                      <div class="metric-trend neutral">
                        <mat-icon>equalizer</mat-icon>
                        Total
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Popular Sports -->
              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Esportes Populares</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="popular-sports">
                    <div class="sport-item" *ngFor="let sport of platformStats.popularSports.slice(0, 5)">
                      <div class="sport-info">
                        <div class="sport-dot" [style.background-color]="sport.color || '#4caf50'"></div>
                        <span class="sport-name">{{ sport.name }}</span>
                      </div>
                      <div class="sport-stats">
                        <span class="highlight-count">{{ sport.highlightCount }} destaques</span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Top Creators -->
              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Top Criadores</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="top-creators">
                    <div class="creator-item" *ngFor="let creator of platformStats.topCreators.slice(0, 5)">
                      <img [src]="creator.imgURL || '/assets/default-avatar.png'"
                           [alt]="creator.name"
                           class="creator-avatar">
                      <div class="creator-info">
                        <span class="creator-name">{{ creator.name }}</span>
                        <span class="creator-stats">{{ creator.totalViews }} visualizações</span>
                      </div>
                      <div class="creator-metrics">
                        <span class="metric">{{ creator.highlightCount }} highlights</span>
                        <span class="metric">{{ creator.analysisCount }} análises</span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Em Destaque">
          <div class="trending-section">
            <div class="loading" *ngIf="trendingLoading">
              <mat-progress-bar mode="indeterminate"></mat-progress-bar>
            </div>

            <div class="trending-content" *ngIf="!trendingLoading && trendingContent">
              <div class="trending-controls">
                <mat-form-field appearance="outline">
                  <mat-label>Período</mat-label>
                  <mat-select [(ngModel)]="trendingTimeframe" (selectionChange)="loadTrendingContent()">
                    <mat-option value="1d">Últimas 24 horas</mat-option>
                    <mat-option value="7d">Últimos 7 dias</mat-option>
                    <mat-option value="30d">Últimos 30 dias</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Tipo</mat-label>
                  <mat-select [(ngModel)]="trendingType" (selectionChange)="loadTrendingContent()">
                    <mat-option value="all">Todos</mat-option>
                    <mat-option value="highlights">Destaques</mat-option>
                    <mat-option value="analyses">Análises</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="trending-grid">
                <!-- Trending Highlights -->
                <div class="trending-section" *ngIf="trendingContent.highlights?.length">
                  <h3>🔥 Destaques em Alta</h3>
                  <div class="trending-items">
                    <mat-card class="trending-item" *ngFor="let highlight of trendingContent.highlights.slice(0, 3)">
                      <mat-card-content>
                        <div class="trending-rank">#{{ getHighlightRank(highlight) }}</div>
                        <img [src]="highlight.thumbnailUrl || '/assets/default-highlight.png'"
                             [alt]="highlight.title"
                             class="trending-thumbnail">
                        <div class="trending-info">
                          <h4>{{ highlight.title }}</h4>
                          <p>{{ highlight.author.name }}</p>
                          <div class="trending-stats">
                            <span><mat-icon>visibility</mat-icon> {{ highlight.views }}</span>
                            <span><mat-icon>favorite</mat-icon> {{ highlight.likes }}</span>
                          </div>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>
                </div>

                <!-- Trending Analyses -->
                <div class="trending-section" *ngIf="trendingContent.analyses?.length">
                  <h3>📈 Análises em Alta</h3>
                  <div class="trending-items">
                    <mat-card class="trending-item" *ngFor="let analysis of trendingContent.analyses.slice(0, 3)">
                      <mat-card-content>
                        <div class="trending-rank">#{{ getAnalysisRank(analysis) }}</div>
                        <div class="trending-icon">
                          <mat-icon>trending_up</mat-icon>
                        </div>
                        <div class="trending-info">
                          <h4>{{ analysis.title }}</h4>
                          <p>{{ analysis.author.name }} • {{ analysis.sport.name }}</p>
                          <div class="trending-stats">
                            <span><mat-icon>visibility</mat-icon> {{ analysis.views }}</span>
                            <span><mat-icon>favorite</mat-icon> {{ analysis.likes }}</span>
                            <span *ngIf="analysis.isVerified"><mat-icon>verified</mat-icon> Verificado</span>
                          </div>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Gráficos e Analytics">
          <div class="charts-section">
            <div class="chart-grid">
              <!-- User Growth Chart -->
              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Crescimento de Usuários</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="chart-placeholder">
                    <mat-icon>show_chart</mat-icon>
                    <p>Gráfico de crescimento será implementado com Chart.js</p>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Content Creation Chart -->
              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Criação de Conteúdo</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="chart-placeholder">
                    <mat-icon>bar_chart</mat-icon>
                    <p>Gráfico de criação de conteúdo será implementado</p>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Sport Distribution Chart -->
              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Distribuição por Esporte</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="chart-placeholder">
                    <mat-icon>pie_chart</mat-icon>
                    <p>Gráfico de distribuição será implementado</p>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Engagement Metrics -->
              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Métricas de Engajamento</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="chart-placeholder">
                    <mat-icon>analytics</mat-icon>
                    <p>Gráfico de engajamento será implementado</p>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .statistics-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .period-selector {
      min-width: 200px;
    }

    .loading {
      text-align: center;
      padding: 40px;
    }

    .overview-content {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .metric-card {
      text-align: center;
    }

    .metric-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .metric-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .metric-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .metric-data {
      flex: 1;
      text-align: left;
    }

    .metric-data h2 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
      color: #333;
    }

    .metric-data p {
      margin: 5px 0;
      color: #666;
      font-weight: 500;
    }

    .metric-trend {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
      margin-top: 5px;
    }

    .metric-trend.positive {
      color: #4caf50;
    }

    .metric-trend.negative {
      color: #f44336;
    }

    .metric-trend.neutral {
      color: #666;
    }

    .metric-trend mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .chart-card {
      height: 100%;
    }

    .popular-sports,
    .top-creators {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .sport-item,
    .creator-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      transition: background 0.2s ease;
    }

    .sport-item:hover,
    .creator-item:hover {
      background: #e9ecef;
    }

    .sport-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .sport-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .sport-name {
      font-weight: 500;
      color: #333;
    }

    .sport-stats,
    .creator-metrics {
      display: flex;
      gap: 15px;
      font-size: 14px;
      color: #666;
    }

    .creator-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .creator-info {
      flex: 1;
      margin-left: 15px;
    }

    .creator-name {
      display: block;
      font-weight: 500;
      color: #333;
    }

    .creator-stats {
      font-size: 14px;
      color: #666;
    }

    .trending-controls {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }

    .trending-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 30px;
    }

    .trending-section h3 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .trending-items {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .trending-item {
      position: relative;
    }

    .trending-rank {
      position: absolute;
      top: 10px;
      left: 10px;
      background: #ff4444;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      z-index: 1;
    }

    .trending-thumbnail {
      width: 80px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
    }

    .trending-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
      color: white;
      border-radius: 8px;
    }

    .trending-info {
      flex: 1;
      margin-left: 15px;
    }

    .trending-info h4 {
      margin: 0 0 5px 0;
      color: #333;
    }

    .trending-info p {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
    }

    .trending-stats {
      display: flex;
      gap: 15px;
      font-size: 12px;
      color: #666;
    }

    .trending-stats span {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .trending-stats mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .charts-section {
      margin-top: 20px;
    }

    .chart-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .chart-placeholder {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .chart-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 10px;
    }
  `]
})
export class StatisticsComponent implements OnInit {
  platformStats: PlatformStats | null = null;
  trendingContent: TrendingContent | null = null;
  platformLoading = false;
  trendingLoading = false;

  selectedPeriod = '30d';
  trendingTimeframe = '7d';
  trendingType = 'all';

  constructor(
    private statisticsService: StatisticsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPlatformStats();
    this.loadTrendingContent();
  }

  loadPlatformStats(): void {
    this.platformLoading = true;
    this.statisticsService.getPlatformStats().subscribe({
      next: (stats) => {
        this.platformStats = stats;
        this.platformLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar estatísticas da plataforma', 'Fechar', { duration: 3000 });
        this.platformLoading = false;
      }
    });
  }

  loadTrendingContent(): void {
    this.trendingLoading = true;
    this.statisticsService.getTrendingContent(
      this.trendingTimeframe as '1d' | '7d' | '30d',
      this.trendingType as 'all' | 'highlights' | 'analyses'
    ).subscribe({
      next: (content) => {
        this.trendingContent = content;
        this.trendingLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar conteúdo em destaque', 'Fechar', { duration: 3000 });
        this.trendingLoading = false;
      }
    });
  }

  exportStats(): void {
    this.statisticsService.exportStats('platform', undefined, 'csv').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `esportz-stats-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Estatísticas exportadas com sucesso!', 'Fechar', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Erro ao exportar estatísticas', 'Fechar', { duration: 3000 });
      }
    });
  }

  getHighlightRank(highlight: any): number {
    if (!this.trendingContent?.highlights) return 0;
    return this.trendingContent.highlights.findIndex(h => h.id === highlight.id) + 1;
  }

  getAnalysisRank(analysis: any): number {
    if (!this.trendingContent?.analyses) return 0;
    return this.trendingContent.analyses.findIndex(a => a.id === analysis.id) + 1;
  }
}