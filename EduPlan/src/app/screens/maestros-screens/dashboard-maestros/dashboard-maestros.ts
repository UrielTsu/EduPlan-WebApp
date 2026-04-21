import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

interface RequestItem {
  id: number;
  type: string;
  classroom: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  date: string;
  reason: string;
}

interface ApiSolicitud {
  id: number;
  tipo_solicitud: string;
  aula: string;
  motivo: string;
  informacion_adicional: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada';
  fecha_solicitud: string;
}

interface ApiGrupo {
  id: number;
  codigo: string;
  materia: string;
  docente: string;
  semestre: string;
  dia_semana: string[] | string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  cupo_max?: number;
  inscritos?: number;
}

interface ScheduleItem {
  id: string;
  subject: string;
  group: string;
  semester: string;
  time: string;
  startTime: string;
  endTime: string;
  students: number;
}

@Component({
  selector: 'MaestroHome',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatCardModule, MatButtonModule],
  templateUrl: './dashboard-maestros.html',
  styleUrls: ['./dashboard-maestros.scss']
})
export class MaestroHome {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);
  private readonly dayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  teacherName = signal('');
  requests = signal<RequestItem[]>([]);
  assignedGroups = signal<ApiGrupo[]>([]);
  todaySchedule = signal<ScheduleItem[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  pendingRequests = computed(() => this.requests().filter((request) => request.status === 'pendiente'));
  currentClass = computed<ScheduleItem | null>(() => {
    const nowMinutes = this.getCurrentMinutes();

    return this.todaySchedule().find((item) => {
      const start = this.timeToMinutes(item.startTime);
      const end = this.timeToMinutes(item.endTime);
      return nowMinutes >= start && nowMinutes < end;
    }) ?? null;
  });

  nextClass = computed<ScheduleItem | null>(() => {
    const nowMinutes = this.getCurrentMinutes();

    return this.todaySchedule().find((item) => this.timeToMinutes(item.startTime) > nowMinutes) ?? null;
  });

  stats = computed(() => ({
    classesToday: this.todaySchedule().length,
    activeRequests: this.pendingRequests().length,
    totalStudents: this.assignedGroups().reduce((sum, group) => sum + this.getGroupStudentCount(group), 0),
    totalGroups: this.assignedGroups().length
  }));

  constructor() {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      user: this.authService.getCurrentUser(),
      requests: this.adminService.getSolicitudes(),
      groups: this.adminService.getGrupos()
    }).subscribe({
      next: ({ user, requests, groups }) => {
        this.teacherName.set(user.fullName || user.email);
        const normalizedTeacher = this.normalizeText(user.fullName || user.email);
        const filteredGroups = (groups as unknown as ApiGrupo[]).filter((group) => {
          const teacherName = this.normalizeText(group.docente);
          return !teacherName || teacherName === normalizedTeacher;
        });

        this.assignedGroups.set(filteredGroups);
        this.todaySchedule.set(this.buildTodaySchedule(filteredGroups));
        this.requests.set((requests as unknown as ApiSolicitud[]).map((request) => this.mapApiRequest(request)));
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getApiErrorMessage(error));
        this.requests.set([]);
        this.assignedGroups.set([]);
        this.todaySchedule.set([]);
        this.isLoading.set(false);
      }
    });
  }

  private buildTodaySchedule(groups: ApiGrupo[]): ScheduleItem[] {
    const currentDay = this.getCurrentDayName();

    return groups
      .filter((group) => this.normalizeGroupDays(group.dia_semana).includes(currentDay))
      .map((group) => {
        const startTime = this.normalizeApiTime(group.hora_inicio);
        const endTime = this.normalizeApiTime(group.hora_fin);

        return {
          id: `${group.id}-${currentDay}`,
          subject: group.materia,
          group: group.codigo,
          semester: group.semestre,
          time: `${startTime} - ${endTime}`,
          startTime,
          endTime,
          students: this.getGroupStudentCount(group)
        };
      })
      .filter((item) => item.startTime && item.endTime)
      .sort((left, right) => left.startTime.localeCompare(right.startTime));
  }

  private mapApiRequest(request: ApiSolicitud): RequestItem {
    return {
      id: request.id,
      type: request.tipo_solicitud,
      classroom: request.aula,
      status: this.mapStatus(request.estado),
      date: this.formatDate(request.fecha_solicitud),
      reason: request.motivo
    };
  }

  private mapStatus(status: ApiSolicitud['estado']): RequestItem['status'] {
    if (status === 'Aprobada') {
      return 'aprobada';
    }

    if (status === 'Rechazada') {
      return 'rechazada';
    }

    return 'pendiente';
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }

  private normalizeApiTime(value: string | null | undefined): string {
    return value ? value.slice(0, 5) : '';
  }

  private normalizeGroupDays(days: string[] | string | null): string[] {
    if (Array.isArray(days)) {
      return days.filter((day) => this.dayOrder.includes(day));
    }

    if (typeof days === 'string' && this.dayOrder.includes(days)) {
      return [days];
    }

    return [];
  }

  private getCurrentDayName(): string {
    const currentDay = new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(new Date());
    const normalized = currentDay.charAt(0).toUpperCase() + currentDay.slice(1).toLowerCase();

    if (normalized === 'Miércoles' || normalized === 'Sabado' || normalized === 'Sábado') {
      return normalized === 'Sabado' ? 'Sábado' : normalized;
    }

    return normalized;
  }

  private getCurrentMinutes(): number {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  private timeToMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map((item) => Number(item));
    return hours * 60 + minutes;
  }

  private getGroupStudentCount(group: ApiGrupo): number {
    if (typeof group.inscritos === 'number') {
      return group.inscritos;
    }

    if (typeof group.cupo_max === 'number') {
      return group.cupo_max;
    }

    return 0;
  }

  private normalizeText(value: string | null | undefined): string {
    return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
  }

  private getApiErrorMessage(error: HttpErrorResponse): string {
    const payload = error.error as Record<string, unknown> | string | undefined;

    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }

    if (payload && typeof payload === 'object' && typeof payload['message'] === 'string' && payload['message'].trim()) {
      return payload['message'];
    }

    return 'No fue posible cargar la información del inicio del maestro.';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'aprobada': return 'check_circle';
      case 'rechazada': return 'cancel';
      default: return 'pending';
    }
  }
}
