import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import type { PublicMention } from '../../core/models/post.model';

@Pipe({
  name: 'mention'
})
export class MentionPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(content: string, mentions?: PublicMention[]): SafeHtml {
    if (!content) return content;

    // Regex to find @username (alphanumeric, _, -)
    // Matches @username and captures username
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;

    const replacedContent = content.replace(mentionRegex, (match, username) => {
      // Find the mention in the mentions array
      const mention = mentions?.find(m => m.username === username);
      
      // If we have the mention data with userId, use it; otherwise fall back to username
      const profileUrl = mention ? `/profile/${mention.userId}` : `/profile/${username}`;
      
      // Create a link to the user profile
      // Add 'mention-highlight' class for styling
      return `<a href="${profileUrl}" class="mention-highlight" (click)="$event.stopPropagation()">@${username}</a>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(replacedContent);
  }
}
