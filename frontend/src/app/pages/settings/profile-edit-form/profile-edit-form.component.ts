import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { UploadService } from '../../../core/services/upload.service';
import type { User } from '../../../core/models/user.model';

interface ProfileFormData {
  name: string;
  bio: string;
  location: string;
  website: string;
  imgURL: string;
}

@Component({
  selector: 'app-profile-edit-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './profile-edit-form.component.html',
  styleUrls: ['./profile-edit-form.component.scss']
})
export class ProfileEditFormComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() save = new EventEmitter<ProfileFormData>();
  @Output() cancel = new EventEmitter<void>();

  profileForm!: FormGroup;
  imagePreview: string | null = null;
  uploadingImage = false;

  constructor(
    private fb: FormBuilder,
    private uploadService: UploadService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.profileForm = this.fb.group({
      name: [this.user?.name || '', [Validators.required, Validators.minLength(1)]],
      bio: [this.user?.bio || '', [Validators.maxLength(500)]],
      location: [this.user?.location || '', [Validators.maxLength(100)]],
      website: [this.user?.website || '', [this.validateWebsite]],
      imgURL: [this.user?.imgURL || '']
    });

    this.imagePreview = this.user?.imgURL || null;
  }

  validateWebsite(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value.trim() === '') {
      return null;
    }

    try {
      new URL(control.value);
      return null;
    } catch {
      return { invalidUrl: true };
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    
    // Validate image
    const validation = this.uploadService.validateImage(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Upload image
    this.uploadingImage = true;
    this.uploadService.uploadImage(file)
      .pipe(finalize(() => this.uploadingImage = false))
      .subscribe({
        next: (response) => {
          this.profileForm.patchValue({ imgURL: response.url });
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          alert(error.message || 'Erro ao fazer upload da imagem');
          this.imagePreview = this.user?.imgURL || null;
        }
      });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.save.emit(this.profileForm.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo é obrigatório';
    }
    if (control.errors['minLength']) {
      return 'O nome não pode estar vazio';
    }
    if (control.errors['maxLength']) {
      const maxLength = control.errors['maxLength'].requiredLength;
      return `Máximo de ${maxLength} caracteres`;
    }
    if (control.errors['invalidUrl']) {
      return 'URL inválida';
    }

    return '';
  }
}
