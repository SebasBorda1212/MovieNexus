import { Component, inject, OnInit, signal, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { Hero } from './components/hero/hero';
import { MovieSlider } from '../../shared/components/movie-slider/movie-slider';
import { Movie } from '../../core/models/movie.model';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { SkeletonHero } from '../../shared/components/skeleton-hero/skeleton-hero';
import { SkeletonCard } from '../../shared/components/skeleton-card/skeleton-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Hero, MovieSlider, MovieCard, SkeletonHero, SkeletonCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, AfterViewInit {
  private movieService = inject(MovieService);
  private platformId = inject(PLATFORM_ID);
  
  // Declaramos nuestras Signals para almacenar el estado de forma reactiva
  featuredMovie = signal<Movie | null>(null);
  trendingMovies = signal<Movie[]>([]);
  popularMovies = signal<Movie[]>([]);

  @ViewChild('infiniteAnchor') infiniteAnchor!: ElementRef;
  catalogMovies = signal<Movie[]>([]);
  currentPage = signal(1);
  isFetchingNextPage = signal(false);
  isInitialLoading = signal(true); // Para mostrar el skeleton la primera vez
  skeletonItems = Array(12).fill(0); // 12 tarjetas skeleton placeholder


  ngOnInit(): void {
    // 1. Pedimos las tendencias
    this.movieService.getTrendingMovies().subscribe({
      next: (data) => {
        if (data.results.length > 0) {
          this.featuredMovie.set(data.results[0]); // Ponemos la #1 como Destacada
          this.trendingMovies.set(data.results); // Guardamos la lista completa para el Slider
        }
      }
    });

    // 2. Pedimos las populares
    this.movieService.getPopularMovies().subscribe({
      next: (data) => {
        this.popularMovies.set(data.results);
      }
    });

    // 3. Cargamos la primera página del catálogo de inmediato
    // (el IntersectionObserver se encarga de las páginas siguientes al hacer scroll)
    this.loadMoreMovies();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initInfiniteScroll();
    }
  }

  private initInfiniteScroll(): void {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !this.isFetchingNextPage()) {
        this.loadMoreMovies();
      }
    }, { rootMargin: '200px' });

    observer.observe(this.infiniteAnchor.nativeElement);
  }

  loadMoreMovies(): void {
    this.isFetchingNextPage.set(true);
    const isFirst = this.isInitialLoading(); // ¿Es la primera carga?

    const apiCall$ = new Promise<void>((resolve) => {
      this.movieService.getPopularMovies(this.currentPage()).subscribe({
        next: (data) => {
          this.catalogMovies.set([...this.catalogMovies(), ...data.results]);
          this.currentPage.update(p => p + 1);
          this.isFetchingNextPage.set(false);
          resolve();
        }
      });
    });

    if (isFirst) {
      // Primera carga: esperar mínimo 2 segundos para mostrar el skeleton
      const minDelay$ = new Promise<void>(resolve => setTimeout(resolve, 2000));
      Promise.all([apiCall$, minDelay$]).then(() => {
        this.isInitialLoading.set(false);
      });
    } else {
      // Páginas siguientes: sin delay extra
      apiCall$.then(() => {
        this.isInitialLoading.set(false);
      });
    }
  }
}
