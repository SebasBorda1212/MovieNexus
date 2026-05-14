import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../../core/services/favorites.service';
import { MovieCard } from '../../shared/components/movie-card/movie-card';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, MovieCard],
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
