import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-cursos-d',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  templateUrl: './cursos-d.html',
  styleUrls: ['./cursos-d.scss']
})
export class CursosD implements OnInit {
  course = signal<any>(null);

  // Datos mock (esto normalmente vendría de un servicio)
  private readonly courseData: Record<string, any> = {
    '1': {
      id: '1',
      name: 'Programación Orientada a Objetos',
      code: 'CS301',
      professor: 'Dra. María González López',
      professorEmail: 'maria.gonzalez@profesor.edu',
      schedule: 'Lun, Mié, Vie 10:00-11:30',
      classroom: 'Edificio A - Salón 301',
      students: 35,
      maxStudents: 40,
      semester: '5° Semestre',
      credits: 8,
      color: 'blue',
      progress: 65,
      nextClass: 'Lunes 10:00',
      description: 'Este curso proporciona una introducción completa a los conceptos de programación orientada a objetos. Los estudiantes aprenderán sobre encapsulamiento, herencia, polimorfismo y abstracción utilizando Java como lenguaje principal.',
      objectives: [
        'Comprender los principios fundamentales de la POO',
        'Aplicar patrones de diseño en proyectos reales',
        'Desarrollar software modular y mantenible',
        'Implementar sistemas usando herencia y polimorfismo'
      ],
      topics: [
        { week: 1, title: 'Introducción a POO y conceptos básicos', status: 'completed' },
        { week: 2, title: 'Clases y objetos en Java', status: 'completed' },
        { week: 3, title: 'Encapsulamiento y modificadores de acceso', status: 'completed' },
        { week: 4, title: 'Herencia y relaciones entre clases', status: 'completed' },
        { week: 5, title: 'Polimorfismo y sobrecarga', status: 'current' },
        { week: 6, title: 'Interfaces y clases abstractas', status: 'upcoming' }
      ],
      grades: [
        { concept: 'Tareas y ejercicios', weight: 20, current: 85 },
        { concept: 'Exámenes parciales', weight: 30, current: 78 },
        { concept: 'Proyecto final', weight: 40, current: null },
        { concept: 'Participación', weight: 10, current: 92 },
      ],
      materials: [
        { name: 'Syllabus del curso', type: 'PDF', size: '245 KB', url: '#' },
        { name: 'Libro: "POO con Java"', type: 'PDF', size: '12.4 MB', url: '#' },
        { name: 'Presentación Semana 5', type: 'PPTX', size: '3.2 MB', url: '#' }
      ],
      upcomingTasks: [
        { id: '1', title: 'Proyecto Final - Sistema de Gestión', dueDate: '2026-02-20', priority: 'high' },
        { id: '6', title: 'Lectura - Patrones de Diseño', dueDate: '2026-02-13', priority: 'low' }
      ]
    },
    // ... otros cursos
  };

  // Cálculo automático del promedio actual
  currentGrade = computed(() => {
    const data = this.course();
    if (!data) return 0;
    return data.grades
      .filter((g: any) => g.current !== null)
      .reduce((sum: number, g: any) => sum + (g.current * g.weight / 100), 0);
  });

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.course.set(this.courseData[id]);
    }
  }

  getPriorityClass(priority: string): string {
    return priority === 'high' ? 'bg-danger-subtle text-danger' : 'bg-secondary-subtle text-secondary';
  }
}
