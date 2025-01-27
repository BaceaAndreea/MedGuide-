import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { provideRouter } from '@angular/router'; // Pentru rutare, dacă folosești RouterModule
import { routes } from './app/app.routes';
import {provideHttpClient} from '@angular/common/http'; // Importă rutele tale

if (environment.production) {
  enableProdMode();
}

// Bootstrap direct la AppComponent
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Configurează rutarea
    provideHttpClient(),
  ],
}).catch(err => console.error(err));
