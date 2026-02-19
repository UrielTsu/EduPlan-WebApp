import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

interface Course {
  id: string;
  name: string;
  code: string;
  professor: string;
  schedule: string;
  students: number;
  maxStudents: number;
  semester: string;
  credits: number;
  color: string;
  progress: number;
  nextClass: string;
}

@Component({
  selector: 'app-cursos-a',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatCardModule, MatButtonModule],
  templateUrl: './cursos-a.html',
  styleUrls: ['./cursos-a.scss']
})
export class CursosA {
  // Usamos signals para un mejor rendimiento en Angular
  courses = signal<Course[]>([
    {
      id: '1',
      name: 'Programación Orientada a Objetos',
      code: 'CS301',
      professor: 'Dra. María González López',
      schedule: 'Lun, Mié, Vie 10:00-11:30',
      students: 35,
      maxStudents: 40,
      semester: '5° Semestre',
      credits: 8,
      color: 'blue',
      progress: 65,
      nextClass: 'Lunes 10:00'
    },
    {
      id: '2',
      name: 'Estructuras de Datos Avanzadas',
      code: 'CS302',
      professor: 'Dr. Carlos Ramírez Santos',
      schedule: 'Mar, Jue 8:30-10:00',
      students: 32,
      maxStudents: 35,
      semester: '5° Semestre',
      credits: 8,
      color: 'purple',
      progress: 58,
      nextClass: 'Martes 8:30'
    },
    {
      id: '3',
      name: 'Bases de Datos',
      code: 'CS303',
      professor: 'Dr. Luis Alberto Pérez',
      schedule: 'Lun, Mié 14:00-15:30',
      students: 38,
      maxStudents: 40,
      semester: '5° Semestre',
      credits: 6,
      color: 'green',
      progress: 72,
      nextClass: 'Lunes 14:00'
    },
    {
      id: '4',
      name: 'Desarrollo Web',
      code: 'CS304',
      professor: 'Dra. Ana Martínez Flores',
      schedule: 'Mar, Jue 16:00-17:30',
      students: 30,
      maxStudents: 35,
      semester: '5° Semestre',
      credits: 6,
      color: 'orange',
      progress: 45,
      nextClass: 'Martes 16:00'
    },
    {
      id: '5',
      name: 'Matemáticas Discretas',
      code: 'MAT201',
      professor: 'Dr. José Hernández Cruz',
      schedule: 'Lun, Mié, Vie 12:00-13:00',
      students: 40,
      maxStudents: 40,
      semester: '5° Semestre',
      credits: 6,
      color: 'red',
      progress: 80,
      nextClass: 'Lunes 12:00'
    }
  ]);

  // Cálculo de créditos totales computado automáticamente
  totalCredits = computed(() =>
    this.courses().reduce((sum, course) => sum + course.credits, 0)
  );
}
