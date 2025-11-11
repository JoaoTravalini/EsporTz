import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HighlightsService } from '../../core/services/highlights.service';
import { Highlight, HighlightFilters, User } from '../../core/models';

@Component({
  selector: 'app-highlights',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    MatChipsModule,
    FormsModule
  ],
  template: `
    <div class="highlights-container">
      <div class="header">
        <h1>Destaques Esportivos</h1>
        <button mat-raised-button color="primary" (click)="openCreateHighlight()">
          <mat-icon>add</mat-icon>
          Novo Destaque
        </button>
      </div>

      <mat-tab-group>
        <mat-tab label="Todos">
          <div class="highlights-grid">
            <div class="loading" *ngIf="loading">
              <mat-progress-bar mode="indeterminate"></mat-progress-bar>
              <p>Carregando destaques...</p>
            </div>

            <div class="highlight-cards" *ngIf="!loading">
              <mat-card class="highlight-card" *ngFor="let highlight of highlights">
                <mat-card-header>
                  <div mat-card-avatar>
                    <img [src]="highlight.author.imgURL || '/assets/default-avatar.png'"
                         [alt]="highlight.author.name">
                  </div>
                  <mat-card-title>{{ highlight.title }}</mat-card-title>
                  <mat-card-subtitle>{{ highlight.author.name }}</mat-card-subtitle>
                </mat-card-header>

                <img mat-card-image
                     [src]="highlight.thumbnailUrl || highlight.imageUrl"
                     [alt]="highlight.title"
                     *ngIf="highlight.thumbnailUrl || highlight.imageUrl">

                <video mat-card-image
                       controls
                       *ngIf="highlight.videoUrl && !highlight.thumbnailUrl">
                  <source [src]="highlight.videoUrl" type="video/mp4">
                </video>

                <mat-card-content>
                  <p>{{ highlight.description }}</p>

                  <div class="highlight-tags" *ngIf="highlight.tags?.length">
                    <mat-chip-listbox aria-label="Tags">
                      <mat-chip *ngFor="let tag of highlight.tags" selectable="false">
                        {{ tag }}
                      </mat-chip>
                    </mat-chip-listbox>
                  </div>

                  <div class="highlight-stats">
                    <span class="stat">
                      <mat-icon>visibility</mat-icon>
                      {{ highlight.views }}
                    </span>
                    <span class="stat">
                      <mat-icon>favorite</mat-icon>
                      {{ highlight.likes }}
                    </span>
                    <span class="stat">
                      <mat-icon>sports_soccer</mat-icon>
                      {{ highlight.sport.name }}
                    </span>
                  </div>
                </mat-card-content>

                <mat-card-actions>
                  <button mat-button (click)="toggleLike(highlight)">
                    <mat-icon>{{ isLikedByUser(highlight) ? 'favorite' : 'favorite_border' }}</mat-icon>
                    Curtir
                  </button>
                  <button mat-button (click)="viewHighlight(highlight)">
                    <mat-icon>visibility</mat-icon>
                    Ver Detalhes
                  </button>
                  <button mat-button *ngIf="isAuthor(highlight)" (click)="editHighlight(highlight)">
                    <mat-icon>edit</mat-icon>
                    Editar
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>

            <div class="no-results" *ngIf="!loading && highlights.length === 0">
              <mat-icon>sports_soccer</mat-icon>
              <p>Nenhum destaque encontrado</p>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Em Destaque">
          <div class="highlights-grid">
            <div class="loading" *ngIf="featuredLoading">
              <mat-progress-bar mode="indeterminate"></mat-progress-bar>
            </div>

            <div class="highlight-cards" *ngIf="!featuredLoading">
              <mat-card class="highlight-card featured" *ngFor="let highlight of featuredHighlights">
                <!-- Similar structure but with featured styling -->
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Meus Destaques">
          <div class="highlights-grid">
            <div class="loading" *ngIf="userHighlightsLoading">
              <mat-progress-bar mode="indeterminate"></mat-progress-bar>
            </div>

            <div class="highlight-cards" *ngIf="!userHighlightsLoading">
              <mat-card class="highlight-card" *ngFor="let highlight of userHighlights">
                <!-- Similar structure -->
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .highlights-container {
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

    .highlights-grid {
      min-height: 400px;
    }

    .loading {
      text-align: center;
      padding: 40px;
    }

    .highlight-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .highlight-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .highlight-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .highlight-card.featured {
      border: 2px solid #4caf50;
    }

    .highlight-tags {
      margin: 10px 0;
    }

    .highlight-stats {
      display: flex;
      gap: 15px;
      margin-top: 10px;
      font-size: 14px;
      color: #666;
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
export class HighlightsComponent implements OnInit {
  highlights: Highlight[] = [];
  featuredHighlights: Highlight[] = [];
  userHighlights: Highlight[] = [];
  loading = false;
  featuredLoading = false;
  userHighlightsLoading = false;
  currentUserId: string | null = null;

  constructor(
    private highlightsService: HighlightsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadHighlights();
    this.loadFeaturedHighlights();
    this.loadUserHighlights();
    // TODO: Get current user ID from auth service
    this.currentUserId = localStorage.getItem('userId');
  }

  loadHighlights(filters?: HighlightFilters): void {
    this.loading = true;
    this.highlightsService.getHighlights(filters).subscribe({
      next: (response) => {
        this.highlights = response.highlights;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar destaques', 'Fechar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadFeaturedHighlights(): void {
    this.featuredLoading = true;
    this.highlightsService.getFeaturedHighlights('10').subscribe({
      next: (highlights) => {
        this.featuredHighlights = highlights;
        this.featuredLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar destaques em destaque', 'Fechar', { duration: 3000 });
        this.featuredLoading = false;
      }
    });
  }

  loadUserHighlights(): void {
    if (!this.currentUserId) return;

    this.userHighlightsLoading = true;
    this.highlightsService.getUserHighlights(this.currentUserId, 20, 0).subscribe({
      next: (highlights) => {
        this.userHighlights = highlights;
        this.userHighlightsLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar seus destaques', 'Fechar', { duration: 3000 });
        this.userHighlightsLoading = false;
      }
    });
  }

  toggleLike(highlight: Highlight): void {
    if (!this.currentUserId) {
      this.snackBar.open('Faça login para curtir destaques', 'Fechar', { duration: 3000 });
      return;
    }

    this.highlightsService.toggleLikeHighlight(highlight.id).subscribe({
      next: (response) => {
        highlight.likes = response.likes;
        if (response.liked) {
          highlight.likedBy?.push({ id: this.currentUserId!, name: '' });
        } else {
          highlight.likedBy = highlight.likedBy?.filter(user => user.id !== this.currentUserId);
        }
      },
      error: (error) => {
        this.snackBar.open('Erro ao curtir destaque', 'Fechar', { duration: 3000 });
      }
    });
  }

  isLikedByUser(highlight: Highlight): boolean {
    if (!this.currentUserId) return false;
    return highlight.likedBy?.some(user => user.id === this.currentUserId) || false;
  }

  viewHighlight(highlight: Highlight): void {
    // TODO: Navigate to highlight detail page
    console.log('View highlight:', highlight);
  }

  editHighlight(highlight: Highlight): void {
    // TODO: Open edit dialog
    console.log('Edit highlight:', highlight);
  }

  openCreateHighlight(): void {
    // TODO: Open create highlight dialog
    console.log('Create new highlight');
  }

  isAuthor(highlight: Highlight): boolean {
    return highlight.author.id === this.currentUserId;
  }
}