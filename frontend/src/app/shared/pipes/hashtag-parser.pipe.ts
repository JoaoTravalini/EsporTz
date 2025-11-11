import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'parseHashtags',
  standalone: true
})
export class HashtagParserPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(content: string): SafeHtml {
    if (!content) return '';

    // Regex para encontrar hashtags: # seguido de caracteres alfanuméricos e underscore
    const hashtagRegex = /#(\w+)/g;
    
    // Substitui hashtags por links clicáveis
    const parsed = content.replace(
      hashtagRegex,
      '<a href="/hashtags/$1" class="hashtag-link" onclick="event.stopPropagation()">#$1</a>'
    );
    
    return this.sanitizer.bypassSecurityTrustHtml(parsed);
  }
}
