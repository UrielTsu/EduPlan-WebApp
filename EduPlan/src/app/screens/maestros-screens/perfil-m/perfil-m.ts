import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';


interface TeacherProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  department: string;
  employeeId: string;
  specialty: string;
  yearsOfService: string;
  officeHours: string;
}

@Component({
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './perfil-m.html',
  styleUrls: ['./perfil-m.scss']
})
export class PerfilM {
  profileData = signal<TeacherProfile>({
    name: 'Dr. Carlos Martínez',
    email: 'carlos.martinez@profesor.edu',
    phone: '+52 33 1234 5678',
    address: 'Guadalajara, Jalisco, México',
    birthDate: '15 de Mayo, 1985',
    department: 'Ciencias de la Computación',
    employeeId: 'PROF-2019-001',
    specialty: 'Ingeniería de Software y Algoritmos',
    yearsOfService: '5 años',
    officeHours: 'Lunes a Viernes 14:00-16:00'
  });

  stats = [
    { label: 'Cursos Activos', value: '3', icon: 'book', color: 'blue' },
    { label: 'Total Estudiantes', value: '95', icon: 'person', color: 'green' },
    { label: 'Años de Servicio', value: '5', icon: 'workspace_premium', color: 'purple' },
    { label: 'Horas Semanales', value: '18', icon: 'schedule', color: 'orange' }
  ];

  courses = [
    { name: 'Programación Orientada a Objetos', code: 'CS301', students: 35 },
    { name: 'Estructuras de Datos Avanzadas', code: 'CS302', students: 32 },
    { name: 'Algoritmos Avanzados', code: 'CS401', students: 28 }
  ];
}
