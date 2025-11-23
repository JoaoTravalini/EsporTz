import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './shared/material/material.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { NavbarComponent } from './global/components/navbar/navbar.component';
import { PostComposerComponent } from './global/components/post-composer/post-composer.component';
import { AuthComponent } from './pages/auth/auth.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ClickOutsideDirective } from './global/directives/click-outside.directive';
import { WorkoutStatsCardComponent } from './shared/components/workout-stats-card/workout-stats-card.component';
import { NotificationListComponent } from './pages/notifications/notification-list.component';
import { MentionPipe } from './shared/pipes/mention.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    PostComposerComponent,
    AuthComponent,
    ClickOutsideDirective,
    NotificationListComponent,
    MentionPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    WorkoutStatsCardComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
