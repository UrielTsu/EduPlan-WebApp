import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

interface ChangeRequest {
  id: number;
  teacherName: string;
  type: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

@Component({
  selector: 'dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatCardModule, MatButtonModule, MatListModule],
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.scss']
})
export class AdminDashboard{
  // Datos reactivos con signals
  pendingRequests = signal(15);
  activeTeachers = signal(87);
  totalChangeRequests = signal(8);

  recentRequests = signal<ChangeRequest[]>([
    { id: 1, teacherName: 'Prof. Carlos Ruiz', type: 'Cambio de Horario', date: 'Hace 2 horas', status: 'pending' },
    { id: 2, teacherName: 'Dra. María González', type: 'Cambio de Aula', date: 'Hace 5 horas', status: 'pending' },
    { id: 3, teacherName: 'Prof. Ana Martínez', type: 'Solicitud de Material', date: 'Hace 1 día', status: 'pending' }
  ]);
}
