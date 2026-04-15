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
  // ...existing code...
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
    description: 'Este curso proporciona una introducción completa a los conceptos de programación orientada a objetos con Java.',
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
      { concept: 'Participación', weight: 10, current: 92 }
    ],
    materials: [
      { name: 'Syllabus del curso', type: 'PDF', size: '245 KB', url: '#' },
      { name: 'Libro: "POO con Java"', type: 'PDF', size: '12.4 MB', url: '#' },
      { name: 'Presentación Semana 5', type: 'PPTX', size: '3.2 MB', url: '#' }
    ],
    upcomingTasks: [
      { id: '1', title: 'Proyecto Final - Sistema de Gestión', dueDate: '2026-03-20', priority: 'high' },
      { id: '6', title: 'Lectura - Patrones de Diseño', dueDate: '2026-03-13', priority: 'low' }
    ]
  },

  '2': {
    id: '2',
    name: 'Estructuras de Datos Avanzadas',
    code: 'CS302',
    professor: 'Dr. Carlos Ramírez Santos',
    professorEmail: 'carlos.ramirez@profesor.edu',
    schedule: 'Mar, Jue 08:30-10:00',
    classroom: 'Edificio A - Salón 210',
    students: 32,
    maxStudents: 35,
    semester: '5° Semestre',
    credits: 8,
    color: 'purple',
    progress: 54,
    nextClass: 'Jueves 08:30',
    description: 'Curso de estructuras avanzadas, análisis de complejidad y técnicas de optimización en estructuras dinámicas.',
    objectives: [
      'Implementar árboles balanceados y heaps',
      'Trabajar con tablas hash y grafos',
      'Analizar complejidad temporal y espacial',
      'Seleccionar estructuras avanzadas según el caso'
    ],
    topics: [
      { week: 1, title: 'Repaso de complejidad y ADTs', status: 'completed' },
      { week: 2, title: 'Árboles AVL y Red-Black', status: 'completed' },
      { week: 3, title: 'Heaps y colas de prioridad', status: 'completed' },
      { week: 4, title: 'Hashing y colisiones', status: 'current' },
      { week: 5, title: 'Grafos ponderados', status: 'upcoming' },
      { week: 6, title: 'Algoritmos sobre grafos', status: 'upcoming' }
    ],
    grades: [
      { concept: 'Laboratorios', weight: 30, current: 86 },
      { concept: 'Examen parcial', weight: 25, current: 80 },
      { concept: 'Proyecto técnico', weight: 35, current: null },
      { concept: 'Participación', weight: 10, current: 91 }
    ],
    materials: [
      { name: 'Guía de árboles balanceados', type: 'PDF', size: '1.6 MB', url: '#' },
      { name: 'Colección de problemas', type: 'PDF', size: '730 KB', url: '#' },
      { name: 'Código ejemplo', type: 'ZIP', size: '3.1 MB', url: '#' }
    ],
    upcomingTasks: [
      { id: '12', title: 'Práctica - Hashing', dueDate: '2026-03-11', priority: 'high' },
      { id: '13', title: 'Lectura - Dijkstra', dueDate: '2026-03-08', priority: 'low' }
    ]
  },

  '3': {
    id: '3',
    name: 'Bases de Datos',
    code: 'CS303',
    professor: 'Dr. Luis Alberto Pérez',
    professorEmail: 'luis.perez@profesor.edu',
    schedule: 'Lun, Mié 14:00-15:30',
    classroom: 'Edificio B - Laboratorio 204',
    students: 38,
    maxStudents: 40,
    semester: '5° Semestre',
    credits: 6,
    color: 'green',
    progress: 58,
    nextClass: 'Miércoles 14:00',
    description: 'Curso enfocado en modelado relacional, SQL y administración básica de bases de datos.',
    objectives: [
      'Diseñar modelos entidad-relación',
      'Normalizar esquemas de datos',
      'Escribir consultas SQL intermedias',
      'Aplicar integridad y seguridad básica'
    ],
    topics: [
      { week: 1, title: 'Introducción a bases de datos', status: 'completed' },
      { week: 2, title: 'Modelo entidad-relación', status: 'completed' },
      { week: 3, title: 'Normalización', status: 'completed' },
      { week: 4, title: 'DDL y DML', status: 'current' },
      { week: 5, title: 'JOIN y subconsultas', status: 'upcoming' },
      { week: 6, title: 'Índices básicos', status: 'upcoming' }
    ],
    grades: [
      { concept: 'Prácticas de laboratorio', weight: 25, current: 88 },
      { concept: 'Examen parcial 1', weight: 20, current: 81 },
      { concept: 'Examen parcial 2', weight: 20, current: null },
      { concept: 'Proyecto de base de datos', weight: 35, current: null }
    ],
    materials: [
      { name: 'Guía SQL básica', type: 'PDF', size: '1.1 MB', url: '#' },
      { name: 'Dataset de prácticas', type: 'ZIP', size: '8.6 MB', url: '#' },
      { name: 'Slides - Normalización', type: 'PPTX', size: '2.7 MB', url: '#' }
    ],
    upcomingTasks: [
      { id: '2', title: 'Práctica 4 - Consultas JOIN', dueDate: '2026-03-10', priority: 'high' },
      { id: '7', title: 'Lectura - Índices en SQL', dueDate: '2026-03-06', priority: 'low' }
    ]
  },

  '4': {
    id: '4',
    name: 'Desarrollo Web',
    code: 'CS304',
    professor: 'Dra. Ana Martínez Flores',
    professorEmail: 'ana.martinez@profesor.edu',
    schedule: 'Mar, Jue 16:00-17:30',
    classroom: 'Edificio C - Salón 112',
    students: 30,
    maxStudents: 35,
    semester: '5° Semestre',
    credits: 6,
    color: 'orange',
    progress: 72,
    nextClass: 'Martes 16:00',
    description: 'Asignatura orientada al desarrollo de aplicaciones web modernas con HTML, CSS, JavaScript y frameworks frontend.',
    objectives: [
      'Construir interfaces responsivas',
      'Consumir APIs REST desde el frontend',
      'Aplicar buenas prácticas de componentes',
      'Desplegar aplicaciones web'
    ],
    topics: [
      { week: 1, title: 'Fundamentos de HTML y CSS', status: 'completed' },
      { week: 2, title: 'JavaScript moderno (ES6+)', status: 'completed' },
      { week: 3, title: 'Manejo del DOM y eventos', status: 'completed' },
      { week: 4, title: 'Componentes y enrutamiento', status: 'completed' },
      { week: 5, title: 'Consumo de APIs REST', status: 'current' },
      { week: 6, title: 'Autenticación y despliegue', status: 'upcoming' }
    ],
    grades: [
      { concept: 'Prácticas semanales', weight: 30, current: 90 },
      { concept: 'Quiz técnico', weight: 15, current: 84 },
      { concept: 'Proyecto frontend', weight: 45, current: 87 },
      { concept: 'Participación', weight: 10, current: 95 }
    ],
    materials: [
      { name: 'Plantilla base Angular', type: 'ZIP', size: '5.4 MB', url: '#' },
      { name: 'Guía de consumo de APIs', type: 'PDF', size: '980 KB', url: '#' },
      { name: 'Slides - Routing', type: 'PPTX', size: '2.1 MB', url: '#' }
    ],
    upcomingTasks: [
      { id: '3', title: 'Entrega Sprint 2', dueDate: '2026-03-12', priority: 'high' },
      { id: '8', title: 'Foro: Accesibilidad Web', dueDate: '2026-03-08', priority: 'low' }
    ]
  },

    '5': {
    id: '5',
    name: 'Matemáticas Discretas',
    code: 'MAT201',
    professor: 'Dr. José Hernández Cruz',
    professorEmail: 'jose.hernandez@profesor.edu',
    schedule: 'Lun, Mié, Vie 12:00-13:00',
    classroom: 'Edificio D - Salón 105',
    students: 40,
    maxStudents: 40,
    semester: '5° Semestre',
    credits: 6,
    color: 'red',
    progress: 61,
    nextClass: 'Miércoles 12:00',
    description: 'Curso enfocado en lógica proposicional, teoría de conjuntos, relaciones, funciones, combinatoria y grafos.',
    objectives: [
      'Aplicar lógica formal en problemas computacionales',
      'Resolver problemas de conteo y combinatoria',
      'Modelar relaciones y funciones',
      'Introducir conceptos de teoría de grafos'
    ],
    topics: [
      { week: 1, title: 'Lógica proposicional', status: 'completed' },
      { week: 2, title: 'Conjuntos y operaciones', status: 'completed' },
      { week: 3, title: 'Relaciones y funciones', status: 'completed' },
      { week: 4, title: 'Principios de conteo', status: 'current' },
      { week: 5, title: 'Combinatoria', status: 'upcoming' },
      { week: 6, title: 'Introducción a grafos', status: 'upcoming' }
    ],
    grades: [
      { concept: 'Tareas', weight: 25, current: 84 },
      { concept: 'Examen parcial', weight: 30, current: 79 },
      { concept: 'Proyecto aplicado', weight: 35, current: null },
      { concept: 'Participación', weight: 10, current: 90 }
    ],
    materials: [
      { name: 'Apuntes de lógica', type: 'PDF', size: '1.2 MB', url: '#' },
      { name: 'Guía de combinatoria', type: 'PDF', size: '860 KB', url: '#' },
      { name: 'Ejercicios de grafos', type: 'PDF', size: '540 KB', url: '#' }
    ],
    upcomingTasks: [
      { id: '10', title: 'Tarea 3 - Conteo', dueDate: '2026-03-09', priority: 'high' },
      { id: '11', title: 'Lectura - Grafos básicos', dueDate: '2026-03-07', priority: 'low' }
    ]
  },

};
// ...existing code...

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
