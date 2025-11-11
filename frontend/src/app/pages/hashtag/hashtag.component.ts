import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { HashtagService } from '../../core/services/hashtag.service';

@Component({
  selector: 'app-hashtag',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './hashtag.component.html',
  styleUrls: ['./hashtag.component.scss']
})
export class HashtagComponent implements OnInit {
  tag: string = '';
  posts: any[] = [];
  loading = false;
  error: string | null = null;
  hasMore = true;
  limit = 20;
  offset = 0;

  constructor(
    private route: ActivatedRoute,
    private hashtagService: HashtagService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tag = params['tag'];
      this.loadPosts();
    });
  }

  loadPosts(): void {
    if (this.loading || !this.hasMore) return;

    this.loading = true;
    this.error = null;

    this.hashtagService.getPostsByHashtag(this.tag, this.limit, this.offset).subscribe({
      next: (response) => {
        this.posts = [...this.posts, ...response.posts];
        this.hasMore = response.posts.length === this.limit;
        this.offset += this.limit;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading posts:', err);
        this.error = 'Erro ao carregar posts. Tente novamente.';
        this.loading = false;
      }
    });
  }

  onScroll(): void {
    this.loadPosts();
  }
}
