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

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    NgIf,
    TranslateModule,
    LanguageSelectorComponent,
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

  // Signup form properties
  signUpForm!: FormGroup;
  loading = false;

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


  onLogin() {
    this.submitted = true;
    if(this.loginFormGroup.invalid) return;
    this.authService.login(this.loginFormGroup.value).subscribe({
      next: loginResponse => {
        this.authService.saveToken(loginResponse);
        console.log(loginResponse)
      },
      error : err => {
        console.log(err);
        this.errorMessage = "An error occurred"
      }
    })
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
        // You might want to show a success message here
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
    const password = control.get('password')?.value;
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
    return this.signUpForm.get('confirmPassword');
  }
}


