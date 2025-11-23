import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'mention'
})
export class MentionPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(content: string): SafeHtml {
    if (!content) return content;

    // Regex to find @username (alphanumeric, _, -)
    // Matches @username and captures username
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;

    const replacedContent = content.replace(mentionRegex, (match, username) => {
      // Create a link to the user profile
      // Add 'mention-highlight' class for styling
      return `<a href="/profile/${username}" class="mention-highlight" (click)="$event.stopPropagation()">@${username}</a>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(replacedContent);
  }
}
