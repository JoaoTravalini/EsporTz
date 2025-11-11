import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-media-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <mat-card class="upload-card">
      <mat-card-header>
        <mat-card-title>{{ title }}</mat-card-title>
        <mat-card-subtitle *ngIf="subtitle">{{ subtitle }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="upload-area"
             [class.drag-over]="isDragOver"
             (dragover)="onDragOver($event)"
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event)"
             (click)="fileInput.click()">

          <input #fileInput type="file"
                 [accept]="acceptedTypes"
                 [multiple]="allowMultiple"
                 (change)="onFileSelected($event)"
                 style="display: none;">

          <div class="upload-content">
            <mat-icon class="upload-icon">cloud_upload</mat-icon>
            <p class="upload-text">
              {{ isDragOver ? 'Solte os arquivos aqui' : 'Arraste e solte ou clique para selecionar' }}
            </p>
            <p class="upload-hint" *ngIf="hint">{{ hint }}</p>
          </div>
        </div>

        <div class="preview-container" *ngIf="previewFiles.length > 0">
          <div class="preview-grid">
            <div class="preview-item" *ngFor="let file of previewFiles; let i = index">
              <div class="preview-media">
                <img *ngIf="file.file.type.startsWith('image/')"
                     [src]="file.preview"
                     [alt]="file.file.name"
                     class="preview-image">
                <video *ngIf="file.file.type.startsWith('video/')"
                       [src]="file.preview"
                       class="preview-video"
                       controls></video>
              </div>
              <div class="preview-info">
                <p class="file-name">{{ file.file.name }}</p>
                <p class="file-size">{{ formatFileSize(file.file.size) }}</p>
              </div>
              <button mat-icon-button
                      class="remove-button"
                      (click)="removeFile(i)"
                      color="warn">
                <mat-icon>close</mat-icon>
              </button>
              <mat-progress-bar *ngIf="file.uploading"
                                mode="determinate"
                                [value]="file.progress">
              </mat-progress-bar>
            </div>
          </div>
        </div>

        <div class="upload-actions" *ngIf="previewFiles.length > 0">
          <button mat-raised-button
                  color="primary"
                  [disabled]="uploading"
                  (click)="uploadFiles()">
            <mat-icon>upload</mat-icon>
            {{ uploading ? 'Enviando...' : 'Enviar Arquivos' }}
          </button>
          <button mat-button
                  [disabled]="uploading"
                  (click)="clearFiles()">
            <mat-icon>clear</mat-icon>
            Limpar
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .upload-card {
      max-width: 600px;
      margin: 20px auto;
    }

    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: #fafafa;
    }

    .upload-area:hover,
    .upload-area.drag-over {
      border-color: #3f51b5;
      background-color: #f3f4ff;
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #666;
    }

    .upload-text {
      margin: 0;
      font-size: 16px;
      color: #333;
      font-weight: 500;
    }

    .upload-hint {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .preview-container {
      margin-top: 20px;
    }

    .preview-grid {
      display: grid;
      gap: 15px;
    }

    .preview-item {
      position: relative;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      background: white;
    }

    .preview-media {
      position: relative;
      width: 100%;
      height: 200px;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .preview-image,
    .preview-video {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .preview-info {
      padding: 10px;
      border-top: 1px solid #eee;
    }

    .file-name {
      margin: 0 0 5px 0;
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .file-size {
      margin: 0;
      font-size: 12px;
      color: #666;
    }

    .remove-button {
      position: absolute !important;
      top: 8px;
      right: 8px;
      background: rgba(255, 255, 255, 0.9);
    }

    .upload-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 20px;
    }
  `]
})
export class MediaUploadComponent {
  @Input() title: string = 'Upload de Mídia';
  @Input() subtitle?: string;
  @Input() hint?: string = 'Tipos aceitos: JPG, PNG, MP4, WebP (Máx: 100MB)';
  @Input() acceptedTypes: string = 'image/*,video/*';
  @Input() allowMultiple: boolean = false;
  @Input() uploadUrl?: string;
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() uploadComplete = new EventEmitter<any[]>();
  @Output() uploadProgress = new EventEmitter<{ file: File; progress: number }>();
  @Output() error = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isDragOver = false;
  uploading = false;
  previewFiles: Array<{
    file: File;
    preview: string;
    progress: number;
    uploading: boolean;
    error?: string;
  }> = [];

  constructor(private http: HttpClient) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.handleFiles(files);
  }

  private handleFiles(files: File[]): void {
    const validFiles = files.filter(file => this.validateFile(file));

    if (validFiles.length === 0) {
      this.error.emit('Nenhum arquivo válido selecionado');
      return;
    }

    if (!this.allowMultiple) {
      this.previewFiles = [];
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewFiles.push({
          file,
          preview: e.target?.result as string,
          progress: 0,
          uploading: false
        });
      };
      reader.readAsDataURL(file);
    });

    this.filesSelected.emit(validFiles);
  }

  private validateFile(file: File): boolean {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];

    if (file.size > maxSize) {
      this.error.emit(`Arquivo ${file.name} é muito grande (máx: 100MB)`);
      return false;
    }

    if (!validTypes.includes(file.type)) {
      this.error.emit(`Tipo de arquivo inválido: ${file.type}`);
      return false;
    }

    return true;
  }

  removeFile(index: number): void {
    this.previewFiles.splice(index, 1);
  }

  clearFiles(): void {
    this.previewFiles = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  uploadFiles(): void {
    if (this.previewFiles.length === 0) return;

    this.uploading = true;
    const uploadPromises = this.previewFiles.map((previewFile, index) => {
      previewFile.uploading = true;
      previewFile.progress = 0;

      const formData = new FormData();
      formData.append('file', previewFile.file);

      return this.http.post(this.uploadUrl || '/api/upload', formData, {
        reportProgress: true,
        observe: 'events'
      });
    });

    Promise.all(uploadPromises).then(results => {
      this.uploading = false;
      this.uploadComplete.emit(results);
      this.clearFiles();
    }).catch(error => {
      this.uploading = false;
      this.error.emit('Erro no upload. Tente novamente.');
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}