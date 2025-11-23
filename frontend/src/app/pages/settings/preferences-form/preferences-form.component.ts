import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { User } from '../../../core/models/user.model';

interface PreferencesFormData {
  favoriteSports: string[];
  notifications: {
    highlights: boolean;
    analyses: boolean;
    matches: boolean;
    followedTeams: boolean;
  };
}

@Component({
  selector: 'app-preferences-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './preferences-form.component.html',
  styleUrls: ['./preferences-form.component.scss']
})
export class PreferencesFormComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() save = new EventEmitter<PreferencesFormData>();
  @Output() cancel = new EventEmitter<void>();

  preferencesForm!: FormGroup;
  availableSports = ['Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Corrida', 'Ciclismo', 'Natação', 'MMA'];
  selectedSports: string[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    const preferences = this.user?.preferences;
    
    this.selectedSports = preferences?.favoriteSports || [];

    this.preferencesForm = this.fb.group({
      notifications: this.fb.group({
        highlights: [preferences?.notifications?.highlights ?? true],
        analyses: [preferences?.notifications?.analyses ?? true],
        matches: [preferences?.notifications?.matches ?? true],
        followedTeams: [preferences?.notifications?.followedTeams ?? true]
      })
    });
  }

  toggleSport(sport: string): void {
    const index = this.selectedSports.indexOf(sport);
    if (index >= 0) {
      this.selectedSports.splice(index, 1);
    } else {
      this.selectedSports.push(sport);
    }
  }

  isSportSelected(sport: string): boolean {
    return this.selectedSports.includes(sport);
  }

  onSubmit(): void {
    const formValue = this.preferencesForm.value;
    
    const data: PreferencesFormData = {
      favoriteSports: this.selectedSports,
      notifications: formValue.notifications
    };

    this.save.emit(data);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
