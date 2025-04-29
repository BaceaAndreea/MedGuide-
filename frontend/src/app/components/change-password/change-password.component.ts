import {Component, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {NgClass, NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {LanguageSelectorComponent} from '../language-selector/language-selector.component';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule,
    NgClass,
    NgIf,
    TranslateModule, LanguageSelectorComponent],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  isTemporaryPassword = false;
  userEmail = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    console.log('Change Password Component initialized');
  }

  ngOnInit() {
    console.log('Change Password Component ngOnInit');
    // Get the email and isTemporary from the route parameters if available
    this.route.queryParams.subscribe(params => {
      console.log('Route params:', params);
      if (params['email']) {
        this.userEmail = params['email'];
        this.isTemporaryPassword = params['isTemporary'] === 'true';
        console.log('Using params - Email:', this.userEmail, 'Is Temporary:', this.isTemporaryPassword);
      } else {
        // Fallback to localStorage data
        try {
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          console.log('userData from localStorage:', userData);
          if (userData && userData.username) {
            this.userEmail = userData.username;
            this.isTemporaryPassword = userData.passwordTemporary === true;
            console.log('Using localStorage - Email:', this.userEmail, 'Is Temporary:', this.isTemporaryPassword);
          } else {
            console.log('No user data found in localStorage');
            // If no user data, redirect to login
            this.router.navigate(['/auth']);
          }
        } catch (error) {
          console.error('Error parsing userData from localStorage:', error);
          this.router.navigate(['/auth']);
        }
      }
    });

    this.initForm();
  }

  initForm() {
    console.log('Initializing change password form');
    this.changePasswordForm = new FormGroup({
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  get oldPassword() {
    return this.changePasswordForm.get('oldPassword');
  }

  get newPassword() {
    return this.changePasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.changePasswordForm.get('confirmPassword');
  }

  onSubmit() {
    console.log('Submit change password form');
    if (this.changePasswordForm.invalid) {
      console.log('Form is invalid:', this.changePasswordForm.errors);
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    console.log('Changing password for:', this.userEmail);
    this.authService.changePassword(
      this.userEmail,
      this.oldPassword?.value,
      this.newPassword?.value
    ).subscribe({
      next: () => {
        console.log('Password changed successfully');
        this.isSubmitting = false;
        this.successMessage = 'Password has been changed successfully.';

        // If it was a temporary password, update the local storage
        try {
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          if (userData) {
            userData.passwordTemporary = false;
            localStorage.setItem('userData', JSON.stringify(userData));
            console.log('Updated userData in localStorage:', userData);
          }
        } catch (error) {
          console.error('Error updating userData in localStorage:', error);
        }

        // Redirect after a short delay
        setTimeout(() => {
          console.log('Redirecting after password change');
          // For temporary passwords, redirect to the main application
          if (this.isTemporaryPassword) {
            console.log('Redirecting to main application after temporary password change');
            this.authService.logout(); // Clear local storage
            this.router.navigate(['/auth']); // Redirect to login page
          } else {
            // For regular password changes, navigate back to auth
            console.log('Redirecting to login after regular password change');
            this.authService.logout();
            this.router.navigate(['/auth']);
          }
        }, 2000);
      },
      error: (err) => {
        console.error('Error changing password:', err);
        this.isSubmitting = false;
        if (err.status === 401) {
          this.errorMessage = 'Current password is incorrect.';
        } else {
          this.errorMessage = 'An error occurred. Please try again later.';
        }
      }
    });
  }
}
