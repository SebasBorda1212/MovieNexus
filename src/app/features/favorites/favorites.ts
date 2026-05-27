import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../../core/services/favorites.service';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, MovieCard, EmptyState],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css'
})
export class Favorites {
  favoritesService = inject(FavoritesService);
  
  // Exponemos la Signal a la vista
  get favorites() {
    return this.favoritesService.favorites;
  }
}
