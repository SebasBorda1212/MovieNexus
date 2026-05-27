import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado.';
      // Analizamos si es error de red (cliente) o de servidor (404, 500, 401)
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error de red: ${error.error.message}`;
      } else {
        // ... switch(error.status) ...
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
      console.error('Error Interceptado:', errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};
