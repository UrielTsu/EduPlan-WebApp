import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface Course {
  id: string;
  name: string;
  code: string;
  schedule: string;
  students: number;
  room: string;
  color: string;
}

interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
}

@Component({
  selector: 'app-cursos-m',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './cursos-m.html',
  styleUrls: ['./cursos-m.scss']
})
export class CursosM {
  selectedCourseId = signal<string | null>(null);

  // Datos reactivos de Cursos
  courses = signal<Course[]>([
    { id: '1', name: 'Programación Orientada a Objetos', code: 'CS301', schedule: 'Lun, Mié, Vie 10:00-11:30', students: 35, room: 'Lab 102', color: 'blue' },
    { id: '2', name: 'Estructuras de Datos Avanzadas', code: 'CS302', schedule: 'Mar, Jue 8:30-10:00', students: 32, room: 'Aula 301', color: 'purple' },
    { id: '3', name: 'Algoritmos Avanzados', code: 'CS401', schedule: 'Lun, Mié 14:00-15:30', students: 28, room: 'Aula 405', color: 'green' }
  ]);

  // Datos reactivos de Tareas
  assignments = signal<Assignment[]>([
    { id: '1', courseId: '1', title: 'Implementación de Clases y Objetos', description: 'Crear un sistema de gestión de biblioteca usando POO', dueDate: '2026-03-15', submissions: 28, totalStudents: 35 },
    { id: '2', courseId: '1', title: 'Herencia y Polimorfismo', description: 'Ejercicios prácticos de herencia múltiple', dueDate: '2026-03-20', submissions: 15, totalStudents: 35 },
    { id: '6', courseId: '3', title: 'Algoritmo de Dijkstra', description: 'Implementar el algoritmo de camino más corto', dueDate: '2026-03-10', submissions: 20, totalStudents: 28 }
  ]);

  // Filtros y Estadísticas Computadas
  totalStudentsCount = computed(() => this.courses().reduce((sum, c) => sum + c.students, 0));

  selectedCourseData = computed(() =>
    this.courses().find(c => c.id === this.selectedCourseId())
  );

  courseAssignments = computed(() =>
    this.assignments().filter(a => a.courseId === this.selectedCourseId())
  );

  // Manejo de Modales (Mock de lógica para ejemplo compacto)
  isDeleteModalOpen = signal(false);
  isEditModalOpen = signal(false);
  currentAssignment = signal<Assignment | null>(null);

  selectCourse(id: string) {
    this.selectedCourseId.update(current => current === id ? null : id);
  }

  openEdit(assignment: Assignment) {
    this.currentAssignment.set(assignment);
    this.isEditModalOpen.set(true);
  }

  openDelete(assignment: Assignment) {
    this.currentAssignment.set(assignment);
    this.isDeleteModalOpen.set(true);
  }

  confirmDelete() {
    this.assignments.update(prev => prev.filter(a => a.id !== this.currentAssignment()?.id));
    this.isDeleteModalOpen.set(false);
  }

  getSubmissionRate(a: Assignment): number {
    return (a.submissions / a.totalStudents) * 100;
  }

  getAssignmentCount(courseId: string): number {
    return this.assignments().filter(a => a.courseId === courseId).length;
  }
}
