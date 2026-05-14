import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../core/models/movie.model';
import { CastCard } from '../../shared/components/cast-card/cast-card';
import { Observable, forkJoin } from 'rxjs';
import { CreditsResponse } from '../../core/models/cast.model';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [
    CommonModule,
    CastCard
  ],
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.css'
})
export class MovieDetails {
  private movieService = inject(MovieService);

  // Declaramos un Observable que contendrá TODOS los datos que necesitamos
  movieData$!: Observable<{ details: Movie; credits: CreditsResponse }>;

  @Input() set id(value: string) {
    if (value) {
      // forkJoin dispara ambas peticiones al mismo tiempo
      this.movieData$ = forkJoin({
        details: this.movieService.getMovieById(value),
        credits: this.movieService.getMovieCredits(value)
      });
    }
  }

  getBackdropUrl(path: string | null | undefined): string {
    return path ? `https://image.tmdb.org/t/p/original${path}` : '';
  }
}
