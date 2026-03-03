import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

interface Request {
  id: string;
  type: string;
  classroom: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  date: string;
  reason: string;
}

@Component({
  selector: 'MaestroHome',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatCardModule, MatButtonModule],
  templateUrl: './dashboard-maestros.html',
  styleUrls: ['./dashboard-maestros.scss']
})
export class MaestroHome {
  // Signals para un estado reactivo y moderno
  requests = signal<Request[]>([
    {
      id: '1',
      type: 'Cambio de Aula',
      classroom: 'Aula 301 → Lab 205',
      status: 'pendiente',
      date: '2 Mar 2026',
      reason: 'Se requiere equipo de laboratorio'
    },
    {
      id: '2',
      type: 'Solicitud de Material',
      classroom: 'Lab 101',
      status: 'aprobada',
      date: '28 Feb 2026',
      reason: 'Proyector y pantalla'
    },
    {
      id: '3',
      type: 'Reporte de Falla Técnica',
      classroom: 'Aula 405',
      status: 'pendiente',
      date: '1 Mar 2026',
      reason: 'Sistema de audio no funciona'
    }
  ]);

  currentClass = {
    subject: 'Programación Orientada a Objetos',
    room: 'Lab 102',
    time: '10:00 - 12:00',
    students: 35
  };

  todaySchedule = [
    { time: '08:00', subject: 'Estructuras de Datos', room: 'Aula 301', students: 32 },
    { time: '10:00', subject: 'Programación Orientada a Objetos', room: 'Lab 102', students: 35 },
    { time: '14:00', subject: 'Algoritmos Avanzados', room: 'Aula 405', students: 28 }
  ];

  // Computado para solicitudes pendientes
  pendingRequests = computed(() => this.requests().filter(r => r.status === 'pendiente'));

  // Total de estudiantes hoy
  totalStudents = computed(() => this.todaySchedule.reduce((sum, s) => sum + s.students, 0));

  getStatusIcon(status: string): string {
    switch (status) {
      case 'aprobada': return 'check_circle';
      case 'rechazada': return 'cancel';
      default: return 'pending';
    }
  }
}
