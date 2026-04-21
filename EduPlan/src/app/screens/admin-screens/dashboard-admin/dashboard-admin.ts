import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../services/admin.service';

interface ChangeRequest {
  id: number;
  teacherName: string;
  type: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ApiUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

interface ApiDocente {
  usuario: ApiUser;
}

interface ApiSolicitud {
  id: number;
  tipo_solicitud: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada';
  fecha_solicitud: string;
  docente?: {
    usuario?: ApiUser;
  };
}

@Component({
  selector: 'dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatCardModule, MatButtonModule, MatListModule],
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.scss']
})
export class AdminDashboard implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly requests = signal<ChangeRequest[]>([]);
  readonly activeTeachers = signal(0);

  readonly pendingRequests = computed(() =>
    this.requests().filter((request) => request.status === 'pending').length
  );

  readonly totalChangeRequests = computed(() =>
    this.requests().filter((request) => request.type.trim().toLowerCase() === 'cambio de aula').length
  );

  readonly recentRequests = computed(() =>
    [...this.requests()].slice(0, 5)
  );

  ngOnInit(): void {
    forkJoin({
      docentes: this.adminService.getDocentes(),
      solicitudes: this.adminService.getSolicitudes(),
    }).subscribe({
      next: ({ docentes, solicitudes }) => {
        const teacherList = docentes as unknown as ApiDocente[];
        const requestList = solicitudes as unknown as ApiSolicitud[];

        this.activeTeachers.set(
          teacherList.filter((teacher) => teacher.usuario?.is_active).length
        );

        this.requests.set(
          requestList
            .sort((left, right) => right.fecha_solicitud.localeCompare(left.fecha_solicitud))
            .map((request) => ({
              id: request.id,
              teacherName: this.getTeacherName(request),
              type: request.tipo_solicitud,
              date: this.formatRelativeDate(request.fecha_solicitud),
              status: this.mapRequestStatus(request.estado),
            }))
        );

        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getApiErrorMessage(error));
        this.isLoading.set(false);
      }
    });
  }

  getStatusLabel(status: ChangeRequest['status']): string {
    const labels: Record<ChangeRequest['status'], string> = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada',
    };

    return labels[status];
  }

  private getTeacherName(request: ApiSolicitud): string {
    const firstName = request.docente?.usuario?.first_name?.trim() ?? '';
    const lastName = request.docente?.usuario?.last_name?.trim() ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || request.docente?.usuario?.email || 'Docente no identificado';
  }

  private mapRequestStatus(status: ApiSolicitud['estado']): ChangeRequest['status'] {
    if (status === 'Aprobada') {
      return 'approved';
    }

    if (status === 'Rechazada') {
      return 'rejected';
    }

    return 'pending';
  }

  private formatRelativeDate(value: string): string {
    const requestDate = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - requestDate.getTime();
    const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} min`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `Hace ${diffHours} h`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `Hace ${diffDays} día(s)`;
    }

    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(requestDate);
  }

  private getApiErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (typeof error.error?.message === 'string' && error.error.message.trim()) {
      return error.error.message;
    }

    return 'No se pudo cargar la información del panel de administración.';
  }
}
