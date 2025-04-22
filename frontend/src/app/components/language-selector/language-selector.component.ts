import { Component } from '@angular/core';
import {NgForOf, UpperCasePipe} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [
    NgForOf,
    UpperCasePipe
  ],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss'
})
export class LanguageSelectorComponent {
  availableLanguages = ['ro', 'en', 'de'];
  currentLang: string;

  constructor(private translate: TranslateService) {
    this.currentLang = this.translate.currentLang || 'ro';
    this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('preferredLanguage', lang);
  }
}
