import { Component, inject, OnInit, signal } from '@angular/core';
import { MovieService } from '../../core/services/movie.service';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { Movie } from '../../core/models/movie.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MovieCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private movieService = inject(MovieService);
  
  movies = signal<Movie[]>([]);

  ngOnInit() {
    this.movieService.getTrendingMovies().subscribe({
      next: (data) => {
        this.movies.set(data.results);
      },
      error: (err) => {
        console.error('Error al conectar con la API: ', err);
      }
    });
  }
}
