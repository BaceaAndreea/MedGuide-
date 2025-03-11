import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass, NgIf} from '@angular/common';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    NgIf
  ],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss'
})
export class AuthenticationComponent implements OnInit{
  loginFormGroup!:FormGroup;
  submitted: boolean = false;
  errorMessage!: string;

  constructor(private fb : FormBuilder, private authService : AuthService) {
  }
  ngOnInit(): void {
    this.loginFormGroup = this.fb.group({
      username: ["", [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      password: ["", Validators.required]
    })
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
}
