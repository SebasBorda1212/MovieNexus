import { Component, signal, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../../../core/services/movie.service';
import { Movie } from '../../../../core/models/movie.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private movieService = inject(MovieService);

  searchQuery = signal<string>('');
  searchResults = signal<Movie[]>([]);

  constructor() {
    effect((onCleanup) => {
      const query = this.searchQuery();
      
      if (!query.trim()) {
        this.searchResults.set([]);
        return;
      }

      const timer = setTimeout(() => {
        this.movieService.searchMovies(query).subscribe({
          next: (res) => this.searchResults.set(res.results.slice(0, 5)),
          error: (err) => console.error('Error buscando películas:', err)
        });
      }, 500);

      onCleanup(() => {
        clearTimeout(timer);
      });
    });
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }
}
