import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import type { AuthSuccessResponse } from '../../core/models/auth.model';

type AuthMode = 'login' | 'register';

type LoginForm = {
  email: string;
  password: string;
};

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};
  const scopes = 'read,read_all,profile:read_all,activity:read_all';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {
  mode: AuthMode = 'login';
  loginForm: LoginForm = { email: '', password: '' };
  registerForm: RegisterForm = { name: '', email: '', password: '', confirmPassword: '' };
  loading = false;
  errorMessage: string | null = null;

  readonly stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=181714&response_type=code&redirect_uri=${encodeURIComponent('http://localhost:3000/api/auth/callback')}&approval_prompt=force&scope=${scopes}`;

  private routeSub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.data.subscribe(data => this.applyModeFromRoute(data));
    
    // Verificar se veio de sessão expirada
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'session-expired') {
        this.errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  setMode(mode: AuthMode): void {
    if (this.mode === mode) {
      return;
    }

    this.mode = mode;
    this.errorMessage = null;
    const target = mode === 'login' ? '/login' : '/register';
    void this.router.navigateByUrl(target);
  }

  async handleSubmit(): Promise<void> {
    this.errorMessage = null;

    if (this.mode === 'login') {
      await this.handleLogin();
      return;
    }

    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.errorMessage = 'As senhas precisam ser iguais.';
      return;
    }

    await this.handleRegister();
  }

  handleStravaAuth(): void {
    console.log('Redirecting to Strava auth');
    if (this.stravaAuthUrl && this.stravaAuthUrl !== '#' && typeof window !== 'undefined') {
      window.location.href = this.stravaAuthUrl;
    }
  }

  toggleMode(): void {
    this.setMode(this.mode === 'login' ? 'register' : 'login');
  }

  get heading(): string {
    return this.mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta EsporTz';
  }

  get subtitle(): string {
    return this.mode === 'login'
      ? 'Entre para acompanhar highlights, estatísticas e análises do seu universo esportivo.'
      : 'Faça parte da comunidade para compartilhar highlights, números e debates táticos.';
  }

  get submitLabel(): string {
    return this.mode === 'login' ? 'Entrar' : 'Cadastrar';
  }

  get toggleLabel(): string {
    return this.mode === 'login' ? 'Criar conta' : 'Já tenho conta';
  }

  get togglePrompt(): string {
    return this.mode === 'login' ? 'Novo na EsporTz?' : 'Já está na EsporTz?';
  }

  private async handleLogin(): Promise<void> {
    this.loading = true;
    try {
      const result = await firstValueFrom(this.authService.login(this.loginForm));
      this.onAuthSuccess(result);
    } catch (error) {
      this.handleAuthError(error);
    } finally {
      this.loading = false;
    }
  }

  private async handleRegister(): Promise<void> {
    this.loading = true;
    try {
      const { name, email, password } = this.registerForm;
      const result = await firstValueFrom(this.authService.register({ name, email, password }));
      this.onAuthSuccess(result);
    } catch (error) {
      this.handleAuthError(error);
    } finally {
      this.loading = false;
    }
  }

  private onAuthSuccess(response: AuthSuccessResponse): void {
    this.loginForm = { email: '', password: '' };
    this.registerForm = { name: '', email: '', password: '', confirmPassword: '' };
    this.errorMessage = null;

    // Verificar se há URL de retorno
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    const targetUrl = returnUrl && returnUrl !== '/login' ? returnUrl : '/';

    // Redirect após autenticação bem-sucedida
    void this.router.navigateByUrl(targetUrl);
  }

  private handleAuthError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      this.errorMessage = error.error?.message ?? 'Não foi possível autenticar. Tente novamente.';
      return;
    }

    this.errorMessage = 'Algo deu errado. Tente novamente.';
  }

  private applyModeFromRoute(data: Data): void {
    const mode = data['mode'];
    if (mode === 'login' || mode === 'register') {
      this.mode = mode;
      return;
    }

    // fallback: keep current mode based on url
    const routePath = this.route.snapshot.routeConfig?.path;
    if (routePath === 'register') {
      this.mode = 'register';
    } else {
      this.mode = 'login';
    }
  }
}
