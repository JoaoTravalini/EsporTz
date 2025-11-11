import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecommendationService } from '../../../core/services/recommendation.service';
import { UserRecommendation } from '../../../core/models/hashtag.model';

@Component({
  selector: 'app-recommended-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './recommended-users.component.html',
  styleUrls: ['./recommended-users.component.scss']
})
export class RecommendedUsersComponent implements OnInit {
  @Input() userId!: string;
  @Input() limit: number = 5;

  recommendations: UserRecommendation[] = [];
  loading = false;
  error: string | null = null;
  followingMap: Map<string, boolean> = new Map();

  constructor(private recommendationService: RecommendationService) {}

  ngOnInit(): void {
    if (this.userId) {
      this.loadRecommendations();
    }
  }

  loadRecommendations(): void {
    this.loading = true;
    this.error = null;

    this.recommendationService.getRecommendedUsers(this.userId, this.limit).subscribe({
      next: (response) => {
        this.recommendations = response.recommendations;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading user recommendations:', err);
        this.error = 'Erro ao carregar sugestões';
        this.loading = false;
      }
    });
  }

  formatReason(reason: string): string {
    const reasonMap: Record<string, string> = {
      'similar_hashtags': 'Interesses similares',
      'shared_likes': 'Likes em comum',
      'friend_of_friend': 'Amigo de amigo',
      'popular': 'Popular'
    };
    
    const key = reason.split(':')[0];
    return reasonMap[key] || reason;
  }

  onFollowClick(user: any, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    // TODO: Implement follow/unfollow logic
    const isFollowing = this.followingMap.get(user.id) || false;
    this.followingMap.set(user.id, !isFollowing);
    
    console.log(isFollowing ? 'Unfollow' : 'Follow', user.username);
  }

  isFollowing(userId: string): boolean {
    return this.followingMap.get(userId) || false;
  }

  formatSharedHashtags(hashtags: string[] | undefined): string {
    if (!hashtags || hashtags.length === 0) {
      return '';
    }
    return hashtags.slice(0, 3).map(tag => '#' + tag).join(', ');
  }
}
