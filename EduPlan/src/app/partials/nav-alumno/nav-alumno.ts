import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { filter } from 'rxjs/operators';


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

  constructor(private router: Router) {
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
  }

  isActive(path: string): boolean {
    return this.currentPath === path;
  }

  handleLogout(): void {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    this.router.navigate(['/landing']);
  }

  get firstName(): string {
    return this.userName.split(' ')[0];
  }
}
