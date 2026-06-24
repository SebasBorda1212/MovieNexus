import {
  Component,
  inject,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../../../core/services/comment.service';
import { Comment } from '../../../../core/models/comment.model';

@Component({
  selector: 'app-movie-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movie-comments.component.html',
  styleUrl: './movie-comments.component.css',
  // OnPush hace que Angular solo actualice la vista cuando hay cambios detectados
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieComments implements OnInit, OnChanges {
  private commentService = inject(CommentService);
  private cdr = inject(ChangeDetectorRef);

  @Input() movieId!: number;          // Id de la película (número)

  // ----- Estado interno -----
  comments: Comment[] = [];
  loading = false;
  error = '';
  submitting = false;

  // ----- Formulario -----
  authorName = '';
  commentText = '';
  selectedRating = 5;
  showForm = false;
  successMessage = '';

  // Convierte el número de película en el formato requerido por la API
  get itemId(): string {
    return `movie-${this.movieId}`;
  }

  /* -------------------------------------------------
   *  Ciclo de vida
   * ------------------------------------------------- */
  ngOnInit(): void {
    // Carga inicial cuando el componente se crea
    this.loadComments();
  }

  // Se ejecuta cuando cambia el @Input movieId (p. ej. al navegar a otra película sin destruir el componente)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['movieId'] && !changes['movieId'].firstChange) {
      this.loadComments();
    }
  }

  /* -------------------------------------------------
   *  Carga de comentarios
   * ------------------------------------------------- */
  loadComments(): void {
    this.loading = true;
    this.error = '';

    this.commentService.getComments(this.itemId).subscribe({
      next: (data) => {
        // Orden descendente por fecha
        this.comments = data.sort(
          (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'No se pudieron cargar los comentarios. Asegúrate de que la API está activa.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /* -------------------------------------------------
   *  Manejo del formulario
   * ------------------------------------------------- */
  toggleForm(): void {
    this.showForm = !this.showForm;
    this.successMessage = '';
  }

  setRating(value: number): void {
    this.selectedRating = value;
  }

  submitComment(): void {
    if (!this.authorName.trim() || !this.commentText.trim()) return;
    this.submitting = true;
    this.cdr.markForCheck();

    this.commentService
      .addComment(
        this.itemId,
        this.authorName.trim(),
        this.commentText.trim(),
        this.selectedRating
      )
      .subscribe({
        next: (newComment) => {
          this.comments.unshift(newComment);
          this.authorName = '';
          this.commentText = '';
          this.selectedRating = 5;
          this.showForm = false;
          this.submitting = false;
          this.successMessage = '¡Comentario publicado exitosamente!';

          // Ocultar el mensaje después de 3 s
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);

          this.cdr.markForCheck();
        },
        error: () => {
          this.submitting = false;
          this.error = 'Error al publicar. Reintenta de nuevo.';
          this.cdr.markForCheck();
        }
      });
  }

  // Helper para ngFor.trackBy – ayuda a Angular a reutilizar los elementos del DOM
  trackByCommentId(index: number, comment: Comment): number | undefined {
    return comment.id;
  }
}
