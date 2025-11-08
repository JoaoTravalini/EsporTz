import { Component, EventEmitter, Output } from '@angular/core';

type ComposerAction = {
  icon: 'highlight' | 'stats' | 'analysis';
  label: string;
  description: string;
};

@Component({
  selector: 'app-post-composer',
  templateUrl: './post-composer.component.html',
  styleUrls: ['./post-composer.component.scss']
})
export class PostComposerComponent {
  @Output() readonly submitPost = new EventEmitter<string>();

  isExpanded = false;
  postContent = '';
  readonly userName = 'Joao Travalini';
  readonly userTitle = 'Comentarista esportivo na EsporTz';
  readonly userInitials = this.computeInitials(this.userName);
  readonly actions: ComposerAction[] = [
    { icon: 'highlight', label: 'Highlight', description: 'Compartilhe o lance decisivo da rodada' },
    { icon: 'stats', label: 'Estatísticas', description: 'Mostre números e gráficos do jogo' },
    { icon: 'analysis', label: 'Análise tática', description: 'Escreva sobre estratégias e escalações' }
  ];

  private computeInitials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  openComposer(): void {
    this.isExpanded = true;
  }

  handleCancel(): void {
    this.isExpanded = false;
    this.postContent = '';
  }

  handleSubmit(): void {
    const trimmed = this.postContent.trim();
    if (!trimmed) {
      return;
    }

    this.submitPost.emit(trimmed);
    this.postContent = '';
    this.isExpanded = false;
  }
}
