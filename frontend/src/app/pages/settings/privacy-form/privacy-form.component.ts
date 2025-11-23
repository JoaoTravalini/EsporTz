import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { User } from '../../../core/models/user.model';

interface PrivacyFormData {
  privacy: {
    profilePublic: boolean;
    showStats: boolean;
    allowAnalysisSharing: boolean;
  };
}

@Component({
  selector: 'app-privacy-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './privacy-form.component.html',
  styleUrls: ['./privacy-form.component.scss']
})
export class PrivacyFormComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() save = new EventEmitter<PrivacyFormData>();
  @Output() cancel = new EventEmitter<void>();

  privacyForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    const privacy = this.user?.preferences?.privacy;

    this.privacyForm = this.fb.group({
      privacy: this.fb.group({
        profilePublic: [privacy?.profilePublic ?? true],
        showStats: [privacy?.showStats ?? true],
        allowAnalysisSharing: [privacy?.allowAnalysisSharing ?? true]
      })
    });
  }

  onSubmit(): void {
    this.save.emit(this.privacyForm.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
