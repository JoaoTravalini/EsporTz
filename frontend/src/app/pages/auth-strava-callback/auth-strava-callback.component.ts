import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StravaService } from '../../core/services/strava.service';

@Component({
  selector: 'app-auth-strava-callback',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSnackBarModule
  ],
  template: `
    <div class="callback-container">
      <mat-card class="callback-card">
        <mat-card-content>
          <div class="spinner-container">
            <mat-spinner diameter="60"></mat-spinner>
          </div>
          <h2>Conectando ao Strava...</h2>
          <p *ngIf="!errorMessage">Aguarde enquanto completamos a autenticação.</p>
          <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .callback-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
      padding: 2rem;
    }

    .spinner-container {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }

    h2 {
      margin: 1rem 0;
      color: #333;
      font-size: 1.5rem;
    }

    p {
      color: #666;
      margin: 0.5rem 0;
    }

    .error-message {
      color: #f44336;
      font-weight: 500;
    }
  `]
})
export class AuthStravaCallbackComponent implements OnInit {
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly stravaService: StravaService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const error = params['error'];
      const state = params['state'];

      if (error) {
        this.handleError(error);
        return;
      }

      if (!code) {
        this.handleError('Código de autorização não fornecido.');
        return;
      }

      this.exchangeCode(code, state);
    });
  }

  private exchangeCode(code: string, state?: string): void {
    this.stravaService.exchangeAuthorizationCode(code).subscribe({
      next: (connection) => {
        this.snackBar.open('Conectado ao Strava com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        // Verificar se está em popup
        if (this.isPopup()) {
          // Fechar popup e notificar janela pai
          this.closePopupAndNotifyParent(connection);
        } else {
          // Navegação normal
          const returnPath = this.stravaService.getReturnPathFromState(state ?? null) || '/';
          this.router.navigateByUrl(returnPath);
        }
      },
      error: (error) => {
        console.error('Failed to exchange Strava authorization code:', error);
        this.handleError('Erro ao conectar com o Strava. Tente novamente.');
      }
    });
  }

  private isPopup(): boolean {
    return window.opener && window.opener !== window;
  }

  private closePopupAndNotifyParent(connection: any): void {
    try {
      // Tentar comunicar com a janela pai
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { 
            type: 'STRAVA_AUTH_SUCCESS', 
            connection 
          },
          window.location.origin
        );
      }
    } catch (error) {
      console.warn('Não foi possível comunicar com a janela pai:', error);
    }

    // Fechar popup após pequeno delay
    setTimeout(() => {
      window.close();
    }, 1000);
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });

    if (this.isPopup()) {
      setTimeout(() => {
        window.close();
      }, 2000);
    } else {
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    }
  }
}
