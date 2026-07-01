import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { Movie, WatchProvidersResponse } from '../../core/models/movie.model';
import { CastCard } from '../../shared/components/cast-card/cast-card';
import { MovieTrailer } from './components/movie-trailer/movie-trailer';
import { MovieComments } from './components/movie-comments/movie-comments.component';
import { Observable, forkJoin } from 'rxjs';
import { CreditsResponse } from '../../core/models/cast.model';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [
    CommonModule,
    CastCard,
    MovieTrailer, MovieComments,
  ],
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.css'
})
export class MovieDetails {
  private movieService = inject(MovieService);

  isLeaving = false; // Controla la animación de salida
  userRegion = 'US';

  // Declaramos un Observable que contendrá TODOS los datos que necesitamos
  movieData$!: Observable<{
    details: Movie;
    credits: CreditsResponse;
    watchProviders: WatchProvidersResponse;
  }>;

  constructor() {
    this.userRegion = this.getUserRegion();
  }

  @Input() set id(value: string) {
    if (value) {
      // forkJoin dispara ambas peticiones al mismo tiempo
      this.movieData$ = forkJoin({
        details: this.movieService.getMovieById(value),
        credits: this.movieService.getMovieCredits(value),
        watchProviders: this.movieService.getWatchProviders(value)
      });
    }
  }

  private getUserRegion(): string {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.language) {
      const parts = window.navigator.language.split('-');
      const region = parts[parts.length - 1].toUpperCase();
      return region.length === 2 ? region : 'US';
    }
    return 'US';
  }

  getBackdropUrl(path: string | null | undefined): string {
    return path ? `https://image.tmdb.org/t/p/original${path}` : '';
  }

  getPosterUrl(path: string | null | undefined): string {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : 'assets/no-poster.png';
  }

  goBack(): void {
    this.isLeaving = true; // Activa el fade-out
    setTimeout(() => history.back(), 3000); // Navega después de 3 segundos
  }
}
