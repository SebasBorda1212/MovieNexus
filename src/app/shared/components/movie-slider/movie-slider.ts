import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movie } from '../../../core/models/movie.model';
import { MovieCard } from '../movie-card/movie-card';

@Component({
  selector: 'app-movie-slider',
  standalone: true,
  imports: [CommonModule, MovieCard],
  templateUrl: './movie-slider.html',
  styleUrl: './movie-slider.css'
})
export class MovieSlider {
  @Input({ required: true }) movies: Movie[] = [];
  @Input() title: string = '';

  // Referencia al contenedor de las tarjetas
  @ViewChild('sliderTrack') sliderTrack!: ElementRef<HTMLDivElement>;

  // Función para mover el carrusel
  scroll(direction: 'left' | 'right') {
    const track = this.sliderTrack.nativeElement;
    const scrollAmount = track.clientWidth * 0.8; // Movemos el 80% del ancho visible

    if (direction === 'left') {
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
}
