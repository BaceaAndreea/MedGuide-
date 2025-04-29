import {Component, EventEmitter, Output} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass, NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {AuthService} from '../../services/auth.service';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    NgIf,
    TranslateModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})

export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  @Output() backToLogin = new EventEmitter<void>();

  constructor(private authService: AuthService) {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ])
    });
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.forgotPassword(this.email?.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'If your email is registered, you will receive a temporary password.';
        this.forgotPasswordForm.reset();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'An error occurred. Please try again later.';
        console.error('Error sending password reset:', err);
      }
    });
  }

  goBackToLogin() {
    this.backToLogin.emit();
  }
}
