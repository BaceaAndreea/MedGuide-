import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import {provideHttpClient} from '@angular/common/http';
import {appConfig} from './app/app.config';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent,  appConfig)
.catch(err => console.error(err));
