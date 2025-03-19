import {Component, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {UsersService} from '../../services/users.service';
import {PatientsService} from '../../services/patients.service';
import {EmailExistsValidators} from '../../validators/emailexists.validators';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  signUpForm!: FormGroup;
  loading = false;

  constructor(
    private patientService: PatientsService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
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

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordsMismatch: true };
    }
    return null;
  }

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
        // Afișezi un mesaj de succes sau redirect
        this.loading = false;
        this.signUpForm.reset();
      },
      error: (err) => {
        console.error('Error creating patient:', err);
        // Afișezi un mesaj de eroare
        this.loading = false;
      }
    });
  }
}
