import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

interface ChangeRequest {
  id: string;
  teacherName: string;
  teacherId: string;
  type: string;
  reason: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Tipo definido para evitar errores de asignación
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

@Component({
  selector: 'app-change-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatCardModule, MatButtonModule, MatChipsModule],
  templateUrl: 'solicitudes-admin.html',
  styleUrls: ['solicitudes-admin.scss']
})
export class SolicitudesAdminComponent {
  readonly statusFilters: StatusFilter[] = ['all', 'pending', 'approved', 'rejected'];

  searchTerm = signal('');
  filterStatus = signal<StatusFilter>('all');

  requests = signal<ChangeRequest[]>([
    { id: '1', teacherName: 'Prof. Carlos Ruiz', teacherId: 'DOC001', type: 'Cambio de Horario', reason: 'Conflicto de horario', date: '2025-02-15', status: 'pending' },
    { id: '2', teacherName: 'Dra. María González', teacherId: 'DOC002', type: 'Cambio de Aula', reason: 'Falta equipo', date: '2025-02-15', status: 'pending' },
    { id: '4', teacherName: 'Prof. Roberto Silva', teacherId: 'DOC004', type: 'Cambio de Horario', reason: 'Laboratorio', date: '2025-02-14', status: 'approved' },
    { id: '6', teacherName: 'Dr. José Hernández', teacherId: 'DOC006', type: 'Cambio de Horario', reason: 'Tutorías', date: '2025-02-13', status: 'rejected' },
  ]);

  // Contadores calculados reactivamente
  pendingCount = computed(() => this.requests().filter(r => r.status === 'pending').length);
  approvedCount = computed(() => this.requests().filter(r => r.status === 'approved').length);
  rejectedCount = computed(() => this.requests().filter(r => r.status === 'rejected').length);

  // Lista filtrada
  filteredRequests = computed(() => {
    return this.requests().filter(r => {
      const matchesSearch = r.teacherName.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
                            r.type.toLowerCase().includes(this.searchTerm().toLowerCase());
      const matchesStatus = this.filterStatus() === 'all' || r.status === this.filterStatus();
      return matchesSearch && matchesStatus;
    });
  });

  handleStatus(id: string, newStatus: 'approved' | 'rejected') {
    this.requests.update(reqs => reqs.map(r =>
      r.id === id ? { ...r, status: newStatus } : r
    ));
  }

  // Método de ayuda para los botones
  setFilter(status: string) {
    this.filterStatus.set(status as StatusFilter);
  }
}
