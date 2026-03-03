import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

type GestionTabKey = 'periodos' | 'materias' | 'grupos' | 'aulas' | 'docentes' | 'estudiantes';

@Component({
  selector: 'app-general-management',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './gestion-admin.html',
  styleUrls: ['./gestion-admin.scss']
})
export class GestionAdminComponent {
  readonly tabs: Array<{ key: GestionTabKey; label: string; icon: string }> = [
    { key: 'periodos', label: 'Periodos', icon: 'calendar_today' },
    { key: 'materias', label: 'Materias', icon: 'menu_book' },
    { key: 'grupos', label: 'Grupos', icon: 'group' },
    { key: 'aulas', label: 'Aulas', icon: 'apartment' },
    { key: 'docentes', label: 'Docentes', icon: 'school' },
    { key: 'estudiantes', label: 'Estudiantes', icon: 'account_circle' }
  ];

  activeTab = signal<GestionTabKey>('periodos');

  periods = signal([
    { id: 1, name: 'Primavera 2025', startDate: '2025-02-01', endDate: '2025-06-30', status: 'Activo' },
    { id: 2, name: 'Otoño 2024', startDate: '2024-08-01', endDate: '2024-12-15', status: 'Finalizado' }
  ]);

  subjects = signal([
    { id: 1, code: 'CS301', name: 'Programación Orientada a Objetos', credits: 8, department: 'Sistemas' },
    { id: 2, code: 'CS302', name: 'Estructuras de Datos Avanzadas', credits: 8, department: 'Sistemas' },
    { id: 3, code: 'MAT201', name: 'Matemáticas Discretas', credits: 6, department: 'Matemáticas' }
  ]);

  groups = signal([
    { id: 1, code: 'CS301-A', subject: 'Programación Orientada a Objetos', teacher: 'Prof. Carlos Ruiz', students: 35 },
    { id: 2, code: 'CS302-B', subject: 'Estructuras de Datos Avanzadas', teacher: 'Dra. María González', students: 28 }
  ]);

  classrooms = signal([
    { id: 1, name: 'Aula 101', building: 'Edificio A', capacity: '40 estudiantes', status: 'Disponible' },
    { id: 2, name: 'Lab 205', building: 'Edificio B', capacity: '25 estudiantes', status: 'En uso' }
  ]);

  teachers = signal([
    { id: 1, name: 'Prof. Carlos Ruiz', department: 'Sistemas', email: 'carlos.ruiz@universidad.edu', courses: 3 },
    { id: 2, name: 'Dra. María González', department: 'Sistemas', email: 'maria.gonzalez@universidad.edu', courses: 2 }
  ]);

  students = signal([
    { id: 1, name: 'Juan Pérez', enrollment: 'A01234567', program: 'Ing. en Computación', semester: '5°' },
    { id: 2, name: 'María López', enrollment: 'A01234568', program: 'Ing. en Computación', semester: '5°' }
  ]);

  setActiveTab(tab: GestionTabKey): void {
    this.activeTab.set(tab);
  }

  onCreate(tab: GestionTabKey): void {
    console.log('Crear en', tab);
  }

  editItem(id: number, tab: GestionTabKey): void {
    console.log('Editar', tab, id);
  }

  deleteItem(id: number, tab: GestionTabKey): void {
    switch (tab) {
      case 'periodos':
        this.periods.update((items) => items.filter((item) => item.id !== id));
        break;
      case 'materias':
        this.subjects.update((items) => items.filter((item) => item.id !== id));
        break;
      case 'grupos':
        this.groups.update((items) => items.filter((item) => item.id !== id));
        break;
      case 'aulas':
        this.classrooms.update((items) => items.filter((item) => item.id !== id));
        break;
      case 'docentes':
        this.teachers.update((items) => items.filter((item) => item.id !== id));
        break;
      case 'estudiantes':
        this.students.update((items) => items.filter((item) => item.id !== id));
        break;
    }
  }

  isCurrentTabEmpty(): boolean {
    switch (this.activeTab()) {
      case 'periodos':
        return this.periods().length === 0;
      case 'materias':
        return this.subjects().length === 0;
      case 'grupos':
        return this.groups().length === 0;
      case 'aulas':
        return this.classrooms().length === 0;
      case 'docentes':
        return this.teachers().length === 0;
      case 'estudiantes':
        return this.students().length === 0;
      default:
        return true;
    }
  }
}
