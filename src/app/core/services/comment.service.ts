import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Comment } from '../models/comment.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);
  private API_URL = 'https://api-comentarios-gm6f.onrender.com/api/comments';
  private APP_ID = 'MovieNexus-Aprendiz'; // Personaliza el nombre si lo deseas

  getComments(itemId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.API_URL}/${this.APP_ID}/${itemId}`);
  }

  addComment(itemId: string, author: string, text: string, rating: number): Observable<Comment> {
    const body: Comment = {
      appId: this.APP_ID,
      itemId,
      author,
      text,
      rating
    };
    return this.http.post<Comment>(this.API_URL, body);
  }
}
