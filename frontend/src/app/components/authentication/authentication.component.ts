import {Component, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormBuilder, FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {NgClass, NgIf} from '@angular/common';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {EmailExistsValidators} from '../../validators/emailexists.validators';
import {UsersService} from '../../services/users.service';
import {PatientsService} from '../../services/patients.service';
import {LanguageSelectorComponent} from '../language-selector/language-selector.component';
import {TranslateModule} from '@ngx-translate/core';
import {ForgotPasswordComponent} from '../forgot-password/forgot-password.component';


@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    NgIf,
    TranslateModule,
    LanguageSelectorComponent,
    ForgotPasswordComponent
  ],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss'
})
export class AuthenticationComponent  implements OnInit {
  // Form state
  showLoginForm = true;

  // Login form properties
  loginFormGroup!: FormGroup;
  submitted = false;
  errorMessage = '';
  successMessage = '';

  // Signup form properties
  signUpForm!: FormGroup;
  loading = false;
  showForgotPassword = false;
  showChangePassword = false;
  changePasswordForm!: FormGroup;
  isSubmitting = false;
  userEmail = '';

  constructor(
    private router: Router,
    private authService : AuthService,
    private usersService: UsersService,
    private patientService: PatientsService
  ) {}

  ngOnInit(): void {
    this.initLoginForm();
    this.initSignupForm();
  }

  showForgotPasswordForm(): void {
    this.showForgotPassword = true;
    this.showLoginForm = false;
    this.errorMessage = '';
  }

  closeForgotPasswordForm(): void {
    this.showForgotPassword = false;
    this.showLoginForm = true;
    this.errorMessage = '';
  }

  initLoginForm(): void {
    this.loginFormGroup = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ])
    });
  }

  initSignupForm(): void {
    this.signUpForm = new FormGroup(
      {
        firstName: new FormControl('', [Validators.required]),
        lastName: new FormControl('', [Validators.required]),
        email: new FormControl('', {
          validators: [Validators.required, Validators.email],
          asyncValidators: [EmailExistsValidators.validate(this.usersService)],
          updateOn: 'blur'
        }),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(6)
        ]),
        confirmPassword: new FormControl('', [Validators.required])
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  initChangePasswordForm(): void {
    this.changePasswordForm = new FormGroup({
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordsMatchValidator });
  }

  // Toggle between login and signup forms
  toggleForm(): void {
    this.showLoginForm = !this.showLoginForm;
    this.errorMessage = '';
    this.submitted = false;

    // Reset forms when toggling
    if (this.showLoginForm) {
      this.signUpForm.reset();
    } else {
      this.loginFormGroup.reset();
    }
  }

  onLogin(): void {
    this.submitted = true;
    if (this.loginFormGroup.invalid) {
      return;
    }

    this.authService.login(this.loginFormGroup.value)
      .subscribe({
        next: loggedUser => {
          if (loggedUser.passwordTemporary) {
            // Store email for password change component
            this.userEmail = this.loginFormGroup.value.username;

            // Option 1: Use the built-in changePassword form in the authentication component
            this.initChangePasswordForm();
            this.showChangePassword = true;
            this.showLoginForm = false;

            // Option 2: Or navigate to dedicated change password component (uncomment if using this approach)
            // this.router.navigate(['/change-password'], {
            //   queryParams: {
            //     email: this.loginFormGroup.value.username,
            //     isTemporary: 'true'
            //   }
            // });
          } else {
            // Normal login flow
            this.authService.saveToken(loggedUser);
          }
        },
        error: err => {
          console.error(err);
          this.errorMessage = 'An error occurred';
        }
      });
  }


  onChangePasswordSubmit() {
    if (this.changePasswordForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.changePassword(
      this.userEmail,
      this.oldPassword?.value,
      this.newPassword?.value
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Password has been changed successfully.';

        // If it was a temporary password, we need to update the local storage
        const userData = JSON.parse(localStorage.getItem('userData')!);
        if (userData) {
          userData.passwordTemporary = false;
          localStorage.setItem('userData', JSON.stringify(userData));
        }

        // Redirect after a short delay
        setTimeout(() => {
          // Navigate based on user role
          if (userData.roles.includes('Admin')) {
            this.router.navigate(['/appointments']);
          } else if (userData.roles.includes('Doctor')) {
            this.router.navigate(['/doctor-appointments/' + userData.doctor?.doctorId]);
          } else if (userData.roles.includes('Patient')) {
            this.router.navigate(['/patient-appointments/' + userData.patient?.patientId]);
          } else {
            // Default fallback route
            this.router.navigate(['/']);
          }
        }, 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.status === 401) {
          this.errorMessage = 'Current password is incorrect.';
        } else {
          this.errorMessage = 'An error occurred. Please try again later.';
        }
        console.error('Error changing password:', err);
      }
    });
  }

  // Signup form submission
  onSubmit(): void {
    if (this.signUpForm.invalid) {
      return;
    }
    this.loading = true;
    const formValue = this.signUpForm.value;
    const newPatient = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      user: {
        email: formValue.email,
        password: formValue.password
      },
      medicalHistory: [],
      allergies: []
    };

    this.patientService.savePatient(newPatient).subscribe({
      next: (response) => {
        console.log('Patient created successfully:', response);
        this.loading = false;
        this.signUpForm.reset();

        // Show success message and redirect to login
        this.errorMessage = '';
        this.showLoginForm = true;
      },
      error: (err) => {
        console.error('Error creating patient:', err);
        this.errorMessage = 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }

  // Password match validator
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value || control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  // Getters for signup form fields
  get firstName() {
    return this.signUpForm.get('firstName');
  }

  get lastName() {
    return this.signUpForm.get('lastName');
  }

  get email() {
    return this.signUpForm.get('email');
  }

  get password() {
    return this.signUpForm.get('password');
  }

  get confirmPassword() {
    return this.changePasswordForm ? this.changePasswordForm.get('confirmPassword') : this.signUpForm.get('confirmPassword');
  }

  get oldPassword() {
    return this.changePasswordForm.get('oldPassword');
  }

  get newPassword() {
    return this.changePasswordForm.get('newPassword');
  }
}
