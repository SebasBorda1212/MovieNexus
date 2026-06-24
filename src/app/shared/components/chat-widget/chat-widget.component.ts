import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GeminiService } from '../../../core/services/gemini.service';
import { Movie } from '../../../core/models/movie.model';
import { marked } from 'marked';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.css'
})
export class ChatWidgetComponent implements AfterViewChecked {
  geminiService = inject(GeminiService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('historyContainer') private historyContainer!: ElementRef;

  isOpen = signal<boolean>(false);
  userInput = signal<string>('');

  // Access service signals
  history = this.geminiService.history;
  loading = this.geminiService.loading;

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleChat(): void {
    this.isOpen.update(val => !val);
  }

  async sendMessage(): Promise<void> {
    const text = this.userInput().trim();
    if (!text) return;

    this.userInput.set('');
    await this.geminiService.sendMessage(text);
  }

  getSafeHtml(markdownText: string): SafeHtml {
    try {
      const rawHtml = marked.parse(markdownText) as string;
      return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
    } catch (e) {
      console.error('Error parsing markdown:', e);
      return this.sanitizer.bypassSecurityTrustHtml(markdownText);
    }
  }

  getPosterUrl(posterPath: string | null): string {
    return posterPath
      ? `https://image.tmdb.org/t/p/w342${posterPath}`
      : 'https://placehold.co/342x513?text=No+Poster';
  }

  navigateToMovie(movieId: number): void {
    this.isOpen.set(false);
    this.router.navigate(['/movie', movieId]);
  }

  clearChat(): void {
    this.geminiService.clearHistory();
  }

  private scrollToBottom(): void {
    if (this.historyContainer) {
      try {
        const element = this.historyContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      } catch (err) {
        // ignore
      }
    }
  }
}
