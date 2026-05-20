import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../../../core/services/movie.service';
import { SafePipe } from '../../../../shared/pipes/safe.pipe';

@Component({
  selector: 'app-movie-trailer',
  standalone: true,
  imports: [CommonModule, SafePipe],
  template: `
    @if (trailerKey()) {
      <div class="trailer-wrapper">
        <iframe
          [src]="'https://www.youtube.com/embed/' + trailerKey() | safe"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>
    } @else {
      <div class="no-trailer">
        <p>No hay tráiler disponible para esta película.</p>
      </div>
    }
  `,
  styleUrl: './movie-trailer.css'
})
export class MovieTrailer implements OnInit {
  private movieService = inject(MovieService);

  @Input() movieId!: number | string;

  trailerKey = signal<string | null>(null);

  ngOnInit() {
    if (this.movieId) {
      this.movieService.getMovieVideos(this.movieId).subscribe({
        next: (response) => {
          const video = response.results.find(
            v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
          );
          if (video) {
            this.trailerKey.set(video.key);
          } else {
            this.trailerKey.set(null);
          }
        },
        error: () => {
          this.trailerKey.set(null);
        }
      });
    }
  }
}
