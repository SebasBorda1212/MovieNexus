import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MovieService } from './movie.service';
import { Movie } from '../models/movie.model';
import { firstValueFrom } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: (Movie & { reason: string })[];
}

export interface GeminiApiResponse {
  answer: string;
  recommendations: Array<{ title: string; reason: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private http = inject(HttpClient);
  private movieService = inject(MovieService);

  // Reactive history signal with initial greeting
  readonly history = signal<ChatMessage[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy Nexus AI, tu asistente cinéfilo personal. ¿De qué humor estás hoy o qué tipo de película te gustaría ver? Te puedo dar recomendaciones personalizadas con carteleras al instante.'
    }
  ]);
  readonly loading = signal<boolean>(false);

  async sendMessage(content: string): Promise<void> {
    if (!content.trim()) return;

    // Add user message to history
    this.history.update(history => [...history, { role: 'user', content }]);
    this.loading.set(true);

    try {
      // Map history to simple payload format
      const payload = {
        messages: this.history().map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      };

      const response = await firstValueFrom(
        this.http.post<GeminiApiResponse>('/api/chat', payload)
      );

      // Search movies on TMDB for recommendations to get posters and ids
      const enrichedRecommendations: (Movie & { reason: string })[] = [];
      if (response.recommendations && Array.isArray(response.recommendations)) {
        for (const rec of response.recommendations) {
          try {
            const searchResult = await firstValueFrom(
              this.movieService.searchMovies(rec.title)
            );
            if (searchResult && searchResult.results && searchResult.results.length > 0) {
              const matchedMovie = searchResult.results[0];
              enrichedRecommendations.push({
                ...matchedMovie,
                reason: rec.reason
              });
            }
          } catch (searchError) {
            console.error(`Error searching TMDB for movie: ${rec.title}`, searchError);
          }
        }
      }

      // Add assistant response to history
      this.history.update(history => [
        ...history,
        {
          role: 'assistant',
          content: response.answer,
          recommendations: enrichedRecommendations.length > 0 ? enrichedRecommendations : undefined
        }
      ]);
    } catch (error) {
      console.error('Error sending message to Gemini API:', error);
      this.history.update(history => [
        ...history,
        {
          role: 'assistant',
          content: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor intenta de nuevo.'
        }
      ]);
    } finally {
      this.loading.set(false);
    }
  }

  clearHistory(): void {
    this.history.set([
      {
        role: 'assistant',
        content: '¡Hola! Soy Nexus AI, tu asistente cinéfilo personal. ¿De qué humor estás hoy o qué tipo de película te gustaría ver? Te puedo dar recomendaciones personalizadas con carteleras al instante.'
      }
    ]);
  }
}
