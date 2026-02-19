import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'perfil-a',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule
  ],
  templateUrl: './perfil-a.html',
  styleUrls: ['./perfil-a.scss']
})
export class PerfilA {
  activeTab = signal<'info' | 'academic' | 'stats'>('info');

  // Datos del perfil inicializados con valores por defecto o localStorage
  profileData = signal({
    name: localStorage.getItem('userName') || 'Juan Pérez Martínez',
    email: localStorage.getItem('userEmail') || 'juan.perez@alumno.edu',
    phone: '+52 222 123 4567',
    address: 'Puebla, Puebla, México',
    birthdate: '15 de Mayo, 2003',
    studentId: '202012345',
    institution: 'Benemérita Universidad Autónoma de Puebla',
    faculty: 'Facultad de Ciencias de la Computación',
    program: 'Ingeniería en Ciencias de la Computación',
    semester: '5° Semestre',
    enrollmentDate: 'Agosto 2020',
    advisor: 'Dra. María González López'
  });

  academicStats = {
    currentGPA: 8.7,
    activeCourses: 5,
    creditsCompleted: 120
  };

  constructor(private router: Router) {}

  goBack() {
    window.history.back();
  }
}
