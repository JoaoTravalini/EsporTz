import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hashtag-link',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a 
      [routerLink]="['/hashtags', tag]" 
      class="hashtag-link"
      (click)="onHashtagClick($event)">
      #{{ tag }}
    </a>
  `,
  styles: [`
    .hashtag-link {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
      cursor: pointer;
      
      &:hover {
        color: var(--color-primary-hover);
        text-decoration: underline;
      }
      
      &:active {
        opacity: 0.8;
      }
    }
  `]
})
export class HashtagLinkComponent {
  @Input() tag!: string;
  
  onHashtagClick(event: Event): void {
    event.stopPropagation();
    // TODO: Track analytics
    console.log('Hashtag clicked:', this.tag);
  }
}
