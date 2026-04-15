import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';


@Component({
  selector: 'tareas-d',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatCardModule, MatButtonModule, MatDividerModule],
  templateUrl: './tareas-d.html',
  styleUrls: ['./tareas-d.scss']
})
export class TareasD implements OnInit {
  task = signal<any>(null);

  private readonly taskData: Record<string, any> = {
    '1': {
      id: '1',
      title: 'Proyecto Final - Sistema de Gestión',
      course: 'Programación Orientada a Objetos',
      courseCode: 'CS301',
      courseId: '1',
      dueDate: '2026-02-20',
      dueTime: '23:59',
      assignedDate: '2026-01-15',
      priority: 'high',
      status: 'pending',
      color: 'purple', // Basado en tu horario de Álgebra/POO
      description: 'Desarrollar un sistema completo de gestión utilizando los principios de programación orientada a objetos aprendidos durante el curso.',
      instructions: [
        'El sistema debe implementar al menos 5 clases con relaciones de herencia',
        'Utilizar polimorfismo en al menos 3 casos de uso diferentes',
        'Implementar encapsulamiento adecuado en todas las clases',
        'Incluir manejo de excepciones personalizado',
        'Documentar el código con comentarios Javadoc',
        'Entregar código fuente + diagrama UML + documentación'
      ],
      attachments: [
        { name: 'Rúbrica detallada.pdf', size: '245 KB', url: '#' },
        { name: 'Ejemplo de proyecto.zip', size: '1.2 MB', url: '#' },
        { name: 'Plantilla UML.pdf', size: '180 KB', url: '#' }
      ]
    },
    '2': {
      id: '2',
      title: 'Tarea 3 - Árboles Binarios',
      course: 'Estructuras de Datos Avanzadas',
      courseCode: 'CS302',
      courseId: '2',
      dueDate: '2026-02-15',
      dueTime: '18:00',
      assignedDate: '2026-02-08',
      priority: 'high',
      status: 'pending',
      color: 'blue',
      description: 'Implementar un árbol binario de búsqueda (BST) completo con todas las operaciones básicas y algunas avanzadas.',
      instructions: [
        'Implementar clase Node y BinarySearchTree en C++',
        'Incluir métodos: insert, search, delete, findMin, findMax',
        'Implementar recorridos: inorder, preorder, postorder',
        'Agregar método para calcular altura del árbol',
        'Escribir casos de prueba para cada método'
      ],
      attachments: [
        { name: 'Especificación de la tarea.pdf', size: '325 KB', url: '#' },
        { name: 'Template código.zip', size: '12 KB', url: '#' }
      ]
    },
    '3': {
      id: '3',
      title: 'Laboratorio 4 - Consultas SQL',
      course: 'Bases de Datos',
      courseCode: 'CS303',
      courseId: '3',
      dueDate: '2026-02-14',
      dueTime: '20:00',
      assignedDate: '2026-02-10',
      priority: 'medium',
      status: 'in-progress',
      color: 'green',
      description: 'Resolver una serie de consultas SQL complejas utilizando joins, subconsultas y funciones agregadas.',
      instructions: [
        'Descargar la base de datos de ejemplo',
        'Resolver las 10 consultas planteadas en el documento',
        'Cada consulta debe estar optimizada',
        'Incluir el plan de ejecución de las 3 consultas más complejas',
        'Documentar el tiempo de ejecución de cada query'
      ],
      attachments: [
        { name: 'Base de datos ejemplo.sql', size: '2.4 MB', url: '#' },
        { name: 'Consultas a resolver.pdf', size: '450 KB', url: '#' }
      ]
    }
  };

  daysUntil = computed(() => {
    const data = this.task();
    if (!data) return 0;
    const today = new Date('2026-02-11');
    const due = new Date(data.dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  });

  isOverdue = computed(() => this.daysUntil() < 0 && this.task()?.status !== 'completed');
  isDueSoon = computed(() => this.daysUntil() >= 0 && this.daysUntil() <= 3 && this.task()?.status !== 'completed');

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.task.set(this.taskData[id] || null);
    }
  }
}
