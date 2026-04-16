import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { finalize } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-nav-alumno',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatMenuModule, MatButtonModule, MatDividerModule],
  templateUrl: './nav-alumno.html',
  styleUrls: ['./nav-alumno.scss']
})
export class NavAlumno implements OnInit {
  userName: string = 'Usuario';
  userRole: string = 'estudiante';
  currentPath: string = '/';
  isLoggingOut = false;

  constructor(private router: Router, private authService: AuthService) {
    // Suscribirse a cambios de ruta para manejar el estado "active"
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPath = event.urlAfterRedirects;
    });
  }

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName') || 'Usuario';
    this.userRole = localStorage.getItem('userRole') || 'estudiante';

    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.userName = user.fullName;
        this.userRole = user.role;
      },
      error: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']);
      }
    });
  }

  isActive(path: string): boolean {
    return this.currentPath === path;
  }

  handleLogout(): void {
    this.isLoggingOut = true;
    this.authService.logout().pipe(
      finalize(() => {
        this.isLoggingOut = false;
        this.authService.clearSession();
        this.router.navigate(['/']);
      })
    ).subscribe();
  }

  get firstName(): string {
    return this.userName.split(' ')[0];
  }

  get profileRoute(): string {
    return this.userRole === 'maestro' ? '/perfil-m' : '/perfil';
  }
}
