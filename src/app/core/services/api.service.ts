import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.get<T>(`${this.baseUrl}${endpoint}`, {
          headers: this.getHeaders()
        }).pipe(
          catchError(this.handleError)
        )
      );
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.post<T>(`${this.baseUrl}${endpoint}`, body, {
          headers: this.getHeaders()
        }).pipe(
          catchError(this.handleError)
        )
      );
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.put<T>(`${this.baseUrl}${endpoint}`, body, {
          headers: this.getHeaders()
        }).pipe(
          catchError(this.handleError)
        )
      );
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
          headers: this.getHeaders()
        }).pipe(
          catchError(this.handleError)
        )
      );
    } catch (error) {
      throw this.formatError(error);
    }
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }

  private formatError(error: unknown): Error {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message || error.message || 'Error en la petición';
      return new Error(`Error ${error.status}: ${message}`);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('Error desconocido en la petición');
  }
}
