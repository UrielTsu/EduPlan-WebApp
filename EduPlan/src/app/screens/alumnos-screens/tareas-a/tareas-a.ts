import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

interface Task {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  dueDate: string;
  dueTime: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  description: string;
  color: string;
}

@Component({
  selector: 'tareas-a',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './tareas-a.html',
  styleUrls: ['./tareas-a.scss']
})
export class TareasA{
  filterStatus = signal<'all' | 'pending' | 'completed'>('all');

  tasks = signal<Task[]>([
    {
      id: '1',
      title: 'Proyecto Final - Sistema de Gestión',
      course: 'Programación Orientada a Objetos',
      courseCode: 'CS301',
      dueDate: '2026-02-20',
      dueTime: '23:59',
      priority: 'high',
      status: 'pending',
      description: 'Desarrollar un sistema completo de gestión usando POO',
      color: 'blue'
    },
    {
      id: '2',
      title: 'Tarea 3 - Árboles Binarios',
      course: 'Estructuras de Datos Avanzadas',
      courseCode: 'CS302',
      dueDate: '2026-02-15',
      dueTime: '18:00',
      priority: 'high',
      status: 'pending',
      description: 'Implementar árbol binario de búsqueda con operaciones CRUD',
      color: 'purple'
    },
    {
      id: '3',
      title: 'Laboratorio 4 - Consultas SQL',
      course: 'Bases de Datos',
      courseCode: 'CS303',
      dueDate: '2026-02-14',
      dueTime: '20:00',
      priority: 'medium',
      status: 'in-progress',
      description: 'Resolver 10 consultas SQL complejas con joins y subconsultas',
      color: 'green'
    },
    // ... el resto de tus tareas mock
  ]);

  filteredTasks = computed(() => {
    const status = this.filterStatus();
    if (status === 'all') return this.tasks();
    return this.tasks().filter(task => task.status === status);
  });

  pendingCount = computed(() => this.tasks().filter(t => t.status === 'pending').length);
  completedCount = computed(() => this.tasks().filter(t => t.status === 'completed').length);

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'completed': 'Completada',
      'in-progress': 'En progreso',
      'pending': 'Pendiente'
    };
    return labels[status] || status;
  }
}
