import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecommendationService } from '../../../core/services/recommendation.service';
import { PostRecommendation } from '../../../core/models/hashtag.model';

@Component({
  selector: 'app-recommended-posts',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './recommended-posts.component.html',
  styleUrls: ['./recommended-posts.component.scss']
})
export class RecommendedPostsComponent implements OnInit {
  @Input() userId!: string;
  @Input() limit: number = 5;

  recommendations: PostRecommendation[] = [];
  loading = false;
  error: string | null = null;

  constructor(private recommendationService: RecommendationService) {}

  ngOnInit(): void {
    if (this.userId) {
      this.loadRecommendations();
    }
  }

  loadRecommendations(): void {
    this.loading = true;
    this.error = null;

    this.recommendationService.getRecommendedPosts(this.userId, this.limit).subscribe({
      next: (response) => {
        this.recommendations = response.recommendations;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading recommendations:', err);
        this.error = 'Erro ao carregar recomendações';
        this.loading = false;
      }
    });
  }

  formatReason(reason: string): string {
    const reasonMap: Record<string, string> = {
      'shared_hashtag': 'Hashtag em comum',
      'liked_by_following': 'Curtido por quem você segue',
      'similar_user': 'De usuário similar',
      'popular': 'Popular'
    };
    
    const key = reason.split(':')[0];
    return reasonMap[key] || reason;
  }

  getReasonIcon(reason: string): string {
    const key = reason.split(':')[0];
    const iconMap: Record<string, string> = {
      'shared_hashtag': 'tag',
      'liked_by_following': 'favorite',
      'similar_user': 'people',
      'popular': 'trending_up'
    };
    
    return iconMap[key] || 'info';
  }
}
