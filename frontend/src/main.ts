import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import {provideHttpClient} from '@angular/common/http';

if (environment.production) {
  enableProdMode();
}
console.log('Initializing Angular app with provideHttpClient');
bootstrapApplication(AppComponent,  {
  providers: [
    provideRouter(routes), // Configurează rutarea
    provideHttpClient(),
  ],
}).catch(err => console.error(err));
