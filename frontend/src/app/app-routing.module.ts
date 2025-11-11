import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthComponent } from './pages/auth/auth.component';
import { HighlightsComponent } from './pages/highlights/highlights.component';
import { TacticalAnalysisComponent } from './pages/tactical-analysis/tactical-analysis.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthStravaCallbackComponent } from './pages/auth-strava-callback/auth-strava-callback.component';
import { HashtagComponent } from './pages/hashtag/hashtag.component';

const routes: Routes = [
  {
    path:'',
    component:HomeComponent
  },
  {
    path: 'highlights',
    component: HighlightsComponent
  },
  {
    path: 'tactical',
    component: TacticalAnalysisComponent
  },
  {
    path: 'statistics',
    component: StatisticsComponent
  },
  {
    path: 'profile/:userId',
    component: ProfileComponent
  },
  {
    path: 'hashtags/:tag',
    component: HashtagComponent
  },
  {
    path: 'login',
    component: AuthComponent,
    data: { mode: 'login' }
  },
  {
    path: 'register',
    component: AuthComponent,
    data: { mode: 'register' }
  },
  {
    path: 'auth',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'auth/strava/callback',
    component: AuthStravaCallbackComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
