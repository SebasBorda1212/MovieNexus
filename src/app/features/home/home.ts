import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { Hero } from './components/hero/hero'; // ¡Importamos el Hero!
import { Movie } from '../../core/models/movie.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Hero], // Lo añadimos a los imports
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private movieService = inject(MovieService);

  // Usamos una Signal para guardar la película destacada
  featuredMovie = signal<Movie | null>(null);

  ngOnInit(): void {
    // Llamamos a la API para obtener las películas en tendencia
    this.movieService.getTrendingMovies().subscribe({
      next: (data) => {
        if (data.results.length > 0) {
          // Tomamos la primera película [0] del array para que sea nuestro Hero
          this.featuredMovie.set(data.results[0]);
        }
      }
    });
  }
}
