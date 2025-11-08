import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template:'<router-outlet> <app-navbar/><router-outlet/>',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'EsporTz';
}
