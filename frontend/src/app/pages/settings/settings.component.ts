import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
import type { User } from '../../core/models/user.model';
import { ProfileEditFormComponent } from './profile-edit-form/profile-edit-form.component';
import { PreferencesFormComponent } from './preferences-form/preferences-form.component';
import { PrivacyFormComponent } from './privacy-form/privacy-form.component';

type SettingsTab = 'profile' | 'preferences' | 'privacy';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ProfileEditFormComponent,
    PreferencesFormComponent,
    PrivacyFormComponent
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  readonly tabs: SettingsTab[] = ['profile', 'preferences', 'privacy'];
  activeTab: SettingsTab = 'profile';
  user: User | null = null;
  loading = false;
  currentUserId: string | null = null;

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.currentUser?.id || null;
    if (this.currentUserId) {
      this.loadUserData();
    } else {
      this.router.navigate(['/auth']);
    }
  }

  loadUserData(): void {
    if (!this.currentUserId) return;

    this.loading = true;
    this.usersService.getUserProfile(this.currentUserId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (user) => {
          this.user = user;
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.snackBar.open('Erro ao carregar dados do usuário', 'Fechar', {
            duration: 3000
          });
        }
      });
  }

  get selectedTabIndex(): number {
    const index = this.tabs.indexOf(this.activeTab);
    return index >= 0 ? index : 0;
  }

  get userInitials(): string {
    if (!this.user?.name) {
      return 'ES';
    }

    return this.user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(segment => segment[0]?.toUpperCase() ?? '')
      .join('') || 'ES';
  }

  get accountProviderLabel(): string {
    const provider = this.user?.provider?.toLowerCase();

    switch (provider) {
      case 'google':
        return 'Conectado com Google';
      case 'strava':
        return 'Conectado com Strava';
      case 'github':
        return 'Conectado com GitHub';
      default:
        return 'Login com e-mail';
    }
  }

  get favoriteSportsSummary(): string {
    const sports = this.user?.preferences?.favoriteSports ?? [];

    if (!sports.length) {
      return 'Selecione esportes para personalizar seu feed.';
    }

    const preview = sports.slice(0, 3).join(', ');
    const remaining = sports.length - 3;

    return remaining > 0 ? `${preview} +${remaining}` : preview;
  }

  get privacySummary(): string {
    const privacy = this.user?.preferences?.privacy;

    if (!privacy) {
      return 'Privacidade padrão: perfil público e estatísticas visíveis.';
    }

    const segments = [
      privacy.profilePublic ? 'Perfil público' : 'Perfil restrito',
      privacy.showStats ? 'Estatísticas visíveis' : 'Estatísticas privadas',
      privacy.allowAnalysisSharing ? 'Compartilhamento ativo' : 'Sem compartilhamento'
    ];

    return segments.join(' • ');
  }

  switchTab(tab?: SettingsTab): void {
    if (!tab) {
      return;
    }
    this.activeTab = tab;
  }

  onCancel(): void {
    if (this.currentUserId) {
      this.router.navigate(['/profile', this.currentUserId]);
    }
  }

  onProfileSave(data: any): void {
    if (!this.currentUserId) return;

    // Atualização otimista - atualizar UI imediatamente
    const previousUser = { ...this.user };
    if (this.user) {
      this.user = { ...this.user, ...data };
    }

    this.loading = true;
    this.usersService.updateUserProfile(this.currentUserId, data)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.snackBar.open('Perfil atualizado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/profile', user.id]);
        },
        error: (error) => {
          // Reverter alterações em caso de erro
          this.user = previousUser as User;
          this.handleError(error);
        }
      });
  }

  onPreferencesSave(data: any): void {
    if (!this.currentUserId) return;

    // Atualização otimista
    const previousUser = { ...this.user };
    if (this.user) {
      this.user = {
        ...this.user,
        preferences: {
          ...this.user.preferences,
          ...data
        }
      };
    }

    this.loading = true;
    this.usersService.updateUserPreferences(this.currentUserId, data)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.snackBar.open('Preferências atualizadas com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          // Reverter alterações em caso de erro
          this.user = previousUser as User;
          this.handleError(error);
        }
      });
  }

  onPrivacySave(data: any): void {
    if (!this.currentUserId) return;

    // Atualização otimista
    const previousUser = { ...this.user };
    if (this.user) {
      this.user = {
        ...this.user,
        preferences: {
          ...this.user.preferences,
          ...data
        }
      };
    }

    this.loading = true;
    this.usersService.updateUserPreferences(this.currentUserId, data)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.snackBar.open('Configurações de privacidade atualizadas!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          // Reverter alterações em caso de erro
          this.user = previousUser as User;
          this.handleError(error);
        }
      });
  }

  private handleError(error: any): void {
    let message = 'Erro ao atualizar dados';

    if (error.status === 400) {
      message = error.error?.message || 'Dados inválidos';
    } else if (error.status === 404) {
      message = 'Usuário não encontrado';
    } else if (error.status === 0) {
      message = 'Erro de conexão. Verifique sua internet';
    }

    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
