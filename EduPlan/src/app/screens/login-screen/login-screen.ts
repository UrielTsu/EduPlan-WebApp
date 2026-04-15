import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'LoginScreen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, RouterModule],
  templateUrl: './login-screen.html',
  styleUrls: ['./login-screen.scss']
})
export class LoginScreen {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  loginError = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getEmailErrorMessage(): string {
    if (this.emailControl?.hasError('required')) {
      return 'El correo electrónico es requerido';
    }
    if (this.emailControl?.hasError('email')) {
      return 'Ingresa un correo electrónico válido';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.passwordControl?.hasError('required')) {
      return 'La contraseña es requerida';
    }
    if (this.passwordControl?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return '';
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginError = '';
    this.isLoading = true;
    const email = this.emailControl?.value ?? '';
    const password = this.passwordControl?.value ?? '';

    this.authService
      .login({ email, password })
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (response) => {
          this.authService.persistSession(response);
          this.navigateByRole(localStorage.getItem('userRole') || 'estudiante');
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400 || error.status === 401) {
            this.loginError = 'Correo o contraseña incorrectos.';
            return;
          }

          this.loginError = 'No fue posible iniciar sesión. Verifica que el backend esté encendido.';
        }
      });
  }

  private navigateByRole(role: string): void {
    if (role === 'admin') {
      this.router.navigate(['admin']);
      return;
    }

    if (role === 'maestro') {
      this.router.navigate(['dashboard-maestros']);
      return;
    }

    this.router.navigate(['dashboard-alumno']);
  }
}
