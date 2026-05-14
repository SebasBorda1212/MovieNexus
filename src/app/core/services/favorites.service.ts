import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private platformId = inject(PLATFORM_ID);
  
  // Señal que contendrá el estado de los favoritos
  favorites = signal<Movie[]>([]);

  constructor() {
    this.loadFavorites();
  }

  loadFavorites() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('favorites');
      if (stored) {
        this.favorites.set(JSON.parse(stored));
      }
    }
  }

  toggleFavorite(movie: Movie) {
    const current = this.favorites();
    const index = current.findIndex(m => m.id === movie.id);
    
    let newFavorites: Movie[];
    if (index === -1) {
      newFavorites = [...current, movie]; // Agregar
    } else {
      newFavorites = current.filter(m => m.id !== movie.id); // Remover
    }
    
    this.favorites.set(newFavorites);
    
    // Guardar solo si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    }
  }

  isFavorite(movieId: number): boolean {
    return this.favorites().some(m => m.id === movieId);
  }
}
