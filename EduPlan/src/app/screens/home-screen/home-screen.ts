import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'HomeScreen',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './home-screen.html',
  styleUrls: ['./home-screen.scss']
})
export class HomeScreen {
  // Features data to keep the template clean
  features = [
    {
      title: 'Horario Inteligente',
      description: 'Visualiza tu horario semanal con un diseño intuitivo. Nunca más pierdas una clase.',
      icon: 'bi-calendar3',
      colorClass: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Gestión de Tiempo',
      description: 'Organiza tus tareas y actividades con recordatorios automáticos.',
      icon: 'bi-clock',
      colorClass: 'bg-green-100 text-green-600'
    },
    {
      title: 'Seguimiento de Progreso',
      description: 'Monitorea tu asistencia, calificaciones y rendimiento académico.',
      icon: 'bi-bar-chart-line',
      colorClass: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Notificaciones',
      description: 'Recibe alertas de clases próximas, tareas y eventos importantes.',
      icon: 'bi-bell',
      colorClass: 'bg-orange-100 text-orange-600'
    },
    {
      title: 'Materiales de Estudio',
      description: 'Accede a tus apuntes, materiales y recursos en cualquier momento.',
      icon: 'bi-book',
      colorClass: 'bg-red-100 text-red-600'
    },
    {
      title: 'Inscripciones Fáciles',
      description: 'Gestiona tus inscripciones de materias de forma simple y rápida.',
      icon: 'bi-people',
      colorClass: 'bg-indigo-100 text-indigo-600'
    }
  ];

  benefits = [
    {
      title: '100% Gratuito',
      description: 'Todas las funciones sin costo alguno para estudiantes'
    },
    {
      title: 'Multiplataforma',
      description: 'Accede desde cualquier dispositivo, en cualquier lugar'
    },
    {
      title: 'Sincronización en tiempo real',
      description: 'Tus datos siempre actualizados y seguros'
    }
  ];

  stats = [
    { value: '10K+', label: 'Usuarios activos' },
    { value: '50+', label: 'Universidades' },
    { value: '4.8', label: 'Calificación' },
    { value: '95%', label: 'Satisfacción' }
  ];
}
