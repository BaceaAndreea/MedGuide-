import {Component, OnInit} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {NavbarComponent} from './components/navbar/navbar.component';
import {ReactiveFormsModule} from '@angular/forms';
import {AuthService} from './services/auth.service';
import {NgIf} from '@angular/common';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {LanguageSelectorComponent} from './components/language-selector/language-selector.component';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [RouterModule, NavbarComponent, ReactiveFormsModule, NgIf, LanguageSelectorComponent]
})
export class AppComponent implements OnInit {
  title = 'frontend';
  showNavbar = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    // Configurare traduceri
    this.translate.addLangs(['ro', 'en', 'de']);
    this.translate.setDefaultLang('ro');

    // Verificăm dacă suntem în browser, ca să putem folosi localStorage și getBrowserLang:
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('preferredLanguage');
      if (savedLang && ['ro', 'en', 'de'].includes(savedLang)) {
        this.translate.use(savedLang);
      } else {
        const browserLang = this.translate.getBrowserLang();
        this.translate.use(browserLang?.match(/ro|en|de/) ? browserLang : 'ro');
      }
    } else {
      this.translate.use('ro');
    }

    // Abonare la evenimentele Router-ului
    this.router.events.subscribe(() => {
      // Listează rutele unde vrei să ascunzi sidebar-ul
      const hiddenRoutes = ['/home', '/auth', '/patient-appointments'];
      this.showNavbar = !hiddenRoutes.includes(this.router.url);
    });
  }

  ngOnInit(): void {
    this.authService.autoLogin();
  }

  // Metodă pentru schimbarea limbii
  switchLanguage(lang: string) {
    this.translate.use(lang);
    // Și la setarea preferinței:
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('preferredLanguage', lang);
    }
  }
}
