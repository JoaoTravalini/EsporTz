import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface UploadResponse {
  url: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly uploadUrl = `${environment.apiUrl}/upload`;

  constructor(private readonly http: HttpClient) {}

  uploadImage(file: File): Observable<UploadResponse> {
    const validation = this.validateImage(file);
    if (!validation.valid) {
      return throwError(() => new Error(validation.error));
    }

    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<UploadResponse>(`${this.uploadUrl}/image`, formData).pipe(
      catchError(error => {
        console.error('Error uploading image:', error);
        const message = error.error?.message || 'Erro ao fazer upload da imagem';
        return throwError(() => new Error(message));
      })
    );
  }

  validateImage(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Formato de arquivo não suportado. Use JPG, PNG ou WEBP.' 
      };
    }

    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: 'Arquivo muito grande. O tamanho máximo é 5MB.' 
      };
    }

    return { valid: true };
  }
}
