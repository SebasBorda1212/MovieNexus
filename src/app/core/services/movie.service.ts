import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Movie, MovieResponse } from '../models/movie.model';
import { CreditsResponse } from '../models/cast.model';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private apiUrl = environment.baseUrl;

  getTrendingMovies() {
    return this.http.get<MovieResponse>(`${this.apiUrl}/trending/movie/day`);
  }

  getMovieById(id: string | number) {
    return this.http.get<Movie>(`${this.apiUrl}/movie/${id}`);
  }

  getPopularMovies() {
    return this.http.get<MovieResponse>(`${this.apiUrl}/movie/popular`);
  }

  getMovieCredits(id: string | number) {
    return this.http.get<CreditsResponse>(`${this.apiUrl}/movie/${id}/credits`);
  }

  searchMovies(query: string) {
    return this.http.get<MovieResponse>(`${this.apiUrl}/search/movie?query=${encodeURIComponent(query)}`);
  }
}
