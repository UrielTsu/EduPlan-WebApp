import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { SolicitudUpdate } from '../../../models/admin.models';

interface ChangeRequest {
  id: number;
  teacherName: string;
  teacherId: string;
  teacherEmail: string;
  type: string;
  classroom: string;
  reason: string;
  information: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ApiSolicitud {
  id: number;
  docente?: {
    usuario?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
    numero_empleado: string;
  };
  tipo_solicitud: string;
  aula: string;
  motivo: string;
  informacion_adicional: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada';
  fecha_solicitud: string;
}

// Tipo definido para evitar errores de asignación
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

@Component({
  selector: 'app-change-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatCardModule, MatButtonModule, MatChipsModule, RouterLink],
  templateUrl: 'solicitudes-admin.html',
  styleUrls: ['solicitudes-admin.scss']
})
export class SolicitudesAdminComponent {
  readonly statusFilters: StatusFilter[] = ['all', 'pending', 'approved', 'rejected'];

  searchTerm = signal('');
  filterStatus = signal<StatusFilter>('all');
  isLoading = signal(false);
  errorMessage = signal('');
  updatingIds = signal<number[]>([]);

  requests = signal<ChangeRequest[]>([]);

  constructor(private apiService: AdminService) {
    this.loadRequests();
  }

  // Contadores calculados reactivamente
  pendingCount = computed(() => this.requests().filter(r => r.status === 'pending').length);
  approvedCount = computed(() => this.requests().filter(r => r.status === 'approved').length);
  rejectedCount = computed(() => this.requests().filter(r => r.status === 'rejected').length);

  // Lista filtrada
  filteredRequests = computed(() => {
    return this.requests().filter(r => {
      const matchesSearch = r.teacherName.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
                            r.type.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
                            r.classroom.toLowerCase().includes(this.searchTerm().toLowerCase());
      const matchesStatus = this.filterStatus() === 'all' || r.status === this.filterStatus();
      return matchesSearch && matchesStatus;
    });
  });

  handleStatus(id: number, newStatus: 'approved' | 'rejected'): void {
    if (this.updatingIds().includes(id)) {
      return;
    }

    this.updatingIds.update((ids) => [...ids, id]);
    const payload = {
      estado: newStatus === 'approved' ? 'Aprobada' : 'Rechazada'
    };

    this.apiService.updateSolicitud(id, payload as unknown as SolicitudUpdate).subscribe({
      next: (request) => {
        const mapped = this.mapApiRequest(request as unknown as ApiSolicitud);
        this.requests.update((items) => items.map((item) => (item.id === id ? mapped : item)));
        this.updatingIds.update((ids) => ids.filter((itemId) => itemId !== id));
      },
      error: (error: HttpErrorResponse) => {
        this.updatingIds.update((ids) => ids.filter((itemId) => itemId !== id));
        this.errorMessage.set(this.getApiErrorMessage(error));
      }
    });
  }

  // Método de ayuda para los botones
  setFilter(status: string) {
    this.filterStatus.set(status as StatusFilter);
  }

  statusLabel(status: StatusFilter | ChangeRequest['status']): string {
    const labels: Record<StatusFilter, string> = {
      all: 'Todas',
      pending: 'Pendientes',
      approved: 'Aprobadas',
      rejected: 'Rechazadas'
    };

    return labels[status];
  }

  formatDate(isoDate: string): string {
    const date = new Date(isoDate);

    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  isUpdatingRequest(id: number): boolean {
    return this.updatingIds().includes(id);
  }

  private loadRequests(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.apiService.getSolicitudes().subscribe({
      next: (requests) => {
        const mapped = (requests as unknown as ApiSolicitud[]).map((request) => this.mapApiRequest(request));
        this.requests.set(mapped);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.getApiErrorMessage(error));
      }
    });
  }

  private mapApiRequest(request: ApiSolicitud): ChangeRequest {
    const firstName = request.docente?.usuario?.first_name?.trim() ?? '';
    const lastName = request.docente?.usuario?.last_name?.trim() ?? '';

    return {
      id: request.id,
      teacherName: `${firstName} ${lastName}`.trim() || request.docente?.usuario?.email || 'Docente',
      teacherId: request.docente?.numero_empleado ?? 'Sin ID',
      teacherEmail: request.docente?.usuario?.email ?? '',
      type: request.tipo_solicitud,
      classroom: request.aula,
      reason: request.motivo,
      information: request.informacion_adicional,
      date: request.fecha_solicitud,
      status: this.mapStatus(request.estado)
    };
  }

  private mapStatus(status: ApiSolicitud['estado']): ChangeRequest['status'] {
    if (status === 'Aprobada') {
      return 'approved';
    }

    if (status === 'Rechazada') {
      return 'rejected';
    }

    return 'pending';
  }

  private getApiErrorMessage(error: unknown): string {
    const fallback = 'No fue posible cargar o actualizar las solicitudes.';
    const httpError = error as HttpErrorResponse;
    const payload = httpError?.error as Record<string, unknown> | string | undefined;

    if (!payload) {
      return fallback;
    }

    if (typeof payload === 'string') {
      return payload;
    }

    if (typeof payload['message'] === 'string' && payload['message'].trim()) {
      return payload['message'];
    }

    const messages: string[] = [];
    for (const key of Object.keys(payload)) {
      const value = payload[key];
      if (Array.isArray(value)) {
        messages.push(`${key}: ${value.join(', ')}`);
      } else if (typeof value === 'string') {
        messages.push(`${key}: ${value}`);
      }
    }

    return messages.length > 0 ? messages.join(' | ') : fallback;
  }
}
