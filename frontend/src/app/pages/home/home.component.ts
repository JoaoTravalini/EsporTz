import { Component, OnInit,AfterViewInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { PostsService } from '../../core/services/posts.service';
import { UsersService } from '../../core/services/users.service';
import { PublicPost, PublicUser } from '../../core/models/post.model';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  readonly navigationItems = [
    { label: 'News Feed', icon: 'newspaper', badge: 0, active: true },
    { label: 'Mensagens', icon: 'message', badge: 6 },
    { label: 'Fóruns', icon: 'forum', badge: 3 },
    { label: 'Amigos', icon: 'people', badge: 0 },
    { label: 'Mídia', icon: 'video', badge: 0 },
    { label: 'Configurações', icon: 'settings', badge: 0 }
  ];

  readonly feedTabs = ['Recentes', 'Amigos', 'Popular'];
  selectedTab = this.feedTabs[0];
  public user!:User
  readonly stories = [
    {
      title: 'Treino na altitude',
      author: 'Anatoly Prok',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=60'
    },
    {
      title: 'Arena lotada',
      author: 'Lolita Earns',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=300&q=60'
    }
  ];

  readonly recommendations = [
    { title: 'UI/UX', color: 'linear-gradient(135deg, #fff9ed 0%, #ffe3c7 100%)', icon: '🎨' },
    { title: 'Música', color: 'linear-gradient(135deg, #fff3e0 0%, #ffd7b2 100%)', icon: '🎧' },
    { title: 'Culinária', color: 'linear-gradient(135deg, #fff7e6 0%, #ffe0bc 100%)', icon: '🥗' },
    { title: 'Trilhas', color: 'linear-gradient(135deg, #fff2df 0%, #ffd6ad 100%)', icon: '🥾' }
  ];

  readonly footerLinks = ['Sobre', 'Ajuda', 'Políticas', 'Privacidade'];

  posts: PublicPost[] = [];
  suggestions: PublicUser[] = [];
  isLoadingFeed = false;
  feedError: string | null = null;
  likePending: Record<string, boolean> = {};
  repostPending: Record<string, boolean> = {};
  commentPending: Record<string, boolean> = {};
  followPending: Record<string, boolean> = {};
  commentDrafts: Record<string, string> = {};
  replyComposerOpen: Record<string, boolean> = {};
  readonly followedUserIds = new Set<string>();

  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFeed();
    this.loadSuggestions();
  }
ngAfterViewInit() {
    this.usersService.getUserProfile(this.currentUser?.id as string).subscribe({
      next: (user) => {
        this.user = user;
  },
  error:(err)=>console.log(err)
})

}
  get currentUser() {
    return this.user?this.user:this.authService.currentUser
  }

  get userInitials(): string {
    const user = this.currentUser;
    if (!user) return '';

    const names = user.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  get followingCount(): string {
    const count = this.currentUser?.following?.length || 0;
    if (count >= 1000) {
      return (count / 1000).toFixed(0) + 'k';
    }
    return count.toString();
  }

  get followersCount(): string {
    const count = this.currentUser?.followers?.length || 0;
    if (count >= 1000) {
      return (count / 1000).toFixed(0) + 'k';
    }
    return count.toString();
  }

  get teamsCount(): string {
    const count = this.currentUser?.favoriteTeams?.length || 0;
    if (count >= 1000) {
      return (count / 1000).toFixed(0) + 'k';
    }
    return count.toString();
  }

  handlePost(payload: { content: string; workoutActivityIds?: string[] }): void {
    const { content, workoutActivityIds } = payload;

    this.postsService.createPost({ content, workoutActivityIds }).subscribe({
      next: post => {
        this.posts = [post, ...this.posts];
        this.loadSuggestions();
        this.feedError = null;
      },
      error: error => {
        this.feedError = this.extractErrorMessage(error);
      }
    });
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  handleFollow(user: PublicUser): void {
    if (this.followPending[user.id] || this.followedUserIds.has(user.id)) {
      return;
    }

    this.followPending[user.id] = true;

    this.postsService
      .followUser(user.id)
      .pipe(finalize(() => (this.followPending[user.id] = false)))
      .subscribe({
        next: () => {
          this.followedUserIds.add(user.id);
          this.loadSuggestions();
          this.feedError = null;
        },
        error: error => {
          this.feedError = this.extractErrorMessage(error);
        }
      });
  }
  
  handleLike(postId: string): void {
    if (this.likePending[postId]) {
      return;
    }

    this.likePending[postId] = true;

    this.postsService
      .likePost(postId)
      .pipe(finalize(() => (this.likePending[postId] = false)))
      .subscribe({
        next: post => {
          this.upsertPost(post);
          this.feedError = null;
        },
        error: error => {
          this.feedError = this.extractErrorMessage(error);
        }
      });
  }

  handleRepost(postId: string): void {
    if (this.repostPending[postId]) {
      return;
    }

    this.repostPending[postId] = true;

    this.postsService
      .repost(postId)
      .pipe(finalize(() => (this.repostPending[postId] = false)))
      .subscribe({
        next: post => {
          this.upsertPost(post);
          this.feedError = null;
        },
        error: error => {
          this.feedError = this.extractErrorMessage(error);
        }
      });
  }

  handleComment(postId: string): void {
    const draft = this.commentDrafts[postId]?.trim();

    if (!draft) {
      return;
    }

    this.commentPending[postId] = true;

    this.postsService
      .commentOnPost(postId, draft)
      .pipe(finalize(() => (this.commentPending[postId] = false)))
      .subscribe({
        next: post => {
          this.commentDrafts[postId] = '';
          if (this.replyComposerOpen[postId]) {
            this.replyComposerOpen[postId] = false;
          }
          this.upsertPost(post);
          this.feedError = null;
        },
        error: error => {
          this.feedError = this.extractErrorMessage(error);
        }
      });
  }

  trackPostById(_index: number, post: PublicPost): string {
    return post.id;
  }

  toggleReplyComposer(targetId: string): void {
    this.replyComposerOpen[targetId] = !this.replyComposerOpen[targetId];

    if (!this.replyComposerOpen[targetId]) {
      this.commentDrafts[targetId] = '';
    } else if (!this.commentDrafts[targetId]) {
      this.commentDrafts[targetId] = '';
    }
  }

  reloadFeed(): void {
    this.loadFeed();
  }

  isFollowing(user: PublicUser): boolean {
    return this.followedUserIds.has(user.id);
  }

  private loadFeed(): void {
    this.isLoadingFeed = true;
    this.feedError = null;

    this.postsService
      .loadFeed()
      .pipe(finalize(() => (this.isLoadingFeed = false)))
      .subscribe({
        next: posts => {
          this.posts = posts;
          this.feedError = null;
        },
        error: error => {
          this.feedError = this.extractErrorMessage(error);
        }
      });
  }

  private upsertPost(post: PublicPost): void {
    const index = this.posts.findIndex(item => item.id === post.id);

    if (index === -1) {
      this.posts = [post, ...this.posts];
    } else {
      this.posts = [
        ...this.posts.slice(0, index),
        post,
        ...this.posts.slice(index + 1)
      ];
    }
  }

  private loadSuggestions(): void {
    this.usersService.getSuggestions(5).subscribe({
      next: suggestions => {
        this.suggestions = suggestions.filter(
          user => !this.followedUserIds.has(user.id)
        );
      },
      error: error => {
        console.error('Erro ao carregar sugestões:', error);
        // Fallback: usa sugestões dos posts
        this.refreshSuggestions();
      }
    });
  }

  private refreshSuggestions(): void {
    const map = new Map<string, PublicUser>();
    const currentUserId = this.currentUser?.id;

    for (const post of this.posts) {
      const author = post.author;
      if (!author) {
        continue;
      }

      if (author.id === currentUserId) {
        continue;
      }

      if (this.followedUserIds.has(author.id)) {
        continue;
      }

      map.set(author.id, author);
    }

    this.suggestions = Array.from(map.values());
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? error.message ?? 'Não foi possível concluir a operação.';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Não foi possível concluir a operação.';
  }
}
