import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
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
export class ChatWidgetComponent implements AfterViewChecked, OnInit {
  geminiService = inject(GeminiService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('historyContainer') private historyContainer!: ElementRef;

  isOpen = signal<boolean>(false);
  userInput = signal<string>('');
  isRecording = signal<boolean>(false);
  isMicSupported = signal<boolean>(false);

  private recognition: any;
  private silenceTimer: any;

  // Access service signals
  history = this.geminiService.history;
  loading = this.geminiService.loading;

  ngOnInit(): void {
    this.initSpeechRecognition();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleChat(): void {
    this.isOpen.update(val => !val);
    if (!this.isOpen()) {
      this.stopRecording();
    }
  }

  async sendMessage(): Promise<void> {
    const text = this.userInput().trim();
    this.stopRecording();
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
    this.stopRecording();
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

  private initSpeechRecognition(): void {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.isMicSupported.set(true);
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = window.navigator.language || 'es-ES';

        this.recognition.onstart = () => {
          this.isRecording.set(true);
        };

        this.recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            this.userInput.set(transcript);
            this.resetSilenceTimer();
          }
        };

        this.recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          this.stopRecording();
        };

        this.recognition.onend = () => {
          this.isRecording.set(false);
        };
      }
    }
  }

  toggleRecording(): void {
    if (!this.isMicSupported()) return;

    if (this.isRecording()) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  private startRecording(): void {
    if (this.recognition) {
      this.userInput.set('');
      try {
        this.recognition.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  }

  private stopRecording(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        // already stopped
      }
    }
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    this.isRecording.set(false);
  }

  private resetSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }
    this.silenceTimer = setTimeout(() => {
      this.stopRecording();
      this.sendMessage();
    }, 600);
  }
}
