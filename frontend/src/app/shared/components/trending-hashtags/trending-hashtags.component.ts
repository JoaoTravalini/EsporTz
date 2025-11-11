import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { interval, Subscription } from 'rxjs';
import { HashtagService } from '../../../core/services/hashtag.service';
import { TrendingHashtag } from '../../../core/models/hashtag.model';

@Component({
  selector: 'app-trending-hashtags',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './trending-hashtags.component.html',
  styleUrls: ['./trending-hashtags.component.scss']
})
export class TrendingHashtagsComponent implements OnInit, OnDestroy {
  trendingHashtags: TrendingHashtag[] = [];
  loading = false;
  error: string | null = null;
  private refreshSubscription?: Subscription;

  constructor(private hashtagService: HashtagService) {}

  ngOnInit(): void {
    this.loadTrending();
    
    // Atualiza a cada 5 minutos
    this.refreshSubscription = interval(5 * 60 * 1000).subscribe(() => {
      this.loadTrending(true);
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  loadTrending(silent: boolean = false): void {
    if (!silent) {
      this.loading = true;
    }
    this.error = null;

    this.hashtagService.getTrendingHashtags('24h', 10).subscribe({
      next: (response) => {
        this.trendingHashtags = response.trending;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading trending hashtags:', err);
        this.error = 'Erro ao carregar trending';
        this.loading = false;
      }
    });
  }
}
