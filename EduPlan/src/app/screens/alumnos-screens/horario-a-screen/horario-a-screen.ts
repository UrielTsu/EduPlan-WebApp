import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

interface ScheduleClass {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
  color: string;
  groupCode: string;
}

interface DaySchedule {
  day: string;
  date: string;
  classes: ScheduleClass[];
}

interface ApiUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface ApiStudentGroup {
  id: number;
  codigo: string;
  materia: string;
  docente: string;
  aula?: {
    id: number;
    edificio: string;
    numero: string;
    capacidad: number;
    estado: string;
  } | null;
  semestre: string;
  dia_semana: string[];
  hora_inicio: string | null;
  hora_fin: string | null;
  cupo_max: number;
  inscritos: number;
}

interface ApiEstudiante {
  usuario: ApiUser;
  grupos?: ApiStudentGroup[];
}

@Component({
  selector: 'HorarioA',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './horario-a-screen.html',
  styleUrls: ['./horario-a-screen.scss']
})
export class HorarioA implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly classColors = ['purple', 'blue', 'orange', 'green', 'red'];
  private readonly weekDayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  selectedView = signal<'week' | 'list'>('week');
  isLoading = signal(true);
  errorMessage = signal('');
  weekSchedule = signal<DaySchedule[]>([]);
  timeSlots = signal<string[]>([]);

  totalClasses = computed(() =>
    this.weekSchedule().reduce((sum, day) => sum + day.classes.length, 0)
  );

  ngOnInit(): void {
    forkJoin({
      user: this.authService.getCurrentUser(),
      estudiantes: this.adminService.getEstudiantes(),
    }).subscribe({
      next: ({ user, estudiantes }) => {
        const student = (estudiantes as unknown as ApiEstudiante[]).find((item) => item.usuario?.id === user.id);
        const groups = student?.grupos ?? [];

        this.weekSchedule.set(this.buildWeekSchedule(groups));
        this.timeSlots.set(this.buildTimeSlots(groups));
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getApiErrorMessage(error));
        this.isLoading.set(false);
      }
    });
  }

  getClassPosition(startTime: string, endTime: string) {
    const firstSlot = this.timeSlots()[0] ?? '07:00';
    const startPosition = this.toMinutes(startTime) - this.toMinutes(firstSlot);
    const duration = this.toMinutes(endTime) - this.toMinutes(startTime);
    const rawHeight = (duration / 60) * 64 - 2;
    const clampedHeight = Math.max(Math.min(rawHeight, 156), 92);

    return {
      'top.px': (startPosition / 60) * 64,
      'height.px': clampedHeight
    };
  }

  isCompactClass(classItem: ScheduleClass): boolean {
    const duration = this.toMinutes(classItem.endTime) - this.toMinutes(classItem.startTime);
    return duration <= 90;
  }

  shouldDisplayRoom(classItem: ScheduleClass): boolean {
    return !!classItem.room && classItem.room.trim().toLowerCase() !== 'aula no asignada';
  }

  private buildWeekSchedule(groups: ApiStudentGroup[]): DaySchedule[] {
    const colorMap = this.buildGroupColorMap(groups);
    const weekDates = this.getCurrentWeekDates();

    return this.weekDayOrder.map((day, index) => ({
      day,
      date: weekDates[index] ?? '',
      classes: this.buildClassesForDay(day, groups, colorMap),
    }));
  }

  private buildClassesForDay(day: string, groups: ApiStudentGroup[], colorMap: Map<number, string>): ScheduleClass[] {
    return groups
      .filter((group) => (group.dia_semana ?? []).includes(day) && group.hora_inicio && group.hora_fin)
      .map((group) => ({
        id: `${group.id}-${day}`,
        subject: group.materia,
        teacher: group.docente || 'Docente por asignar',
        room: this.formatClassroom(group),
        startTime: this.normalizeTime(group.hora_inicio),
        endTime: this.normalizeTime(group.hora_fin),
        color: colorMap.get(group.id) ?? this.classColors[0],
        groupCode: group.codigo,
      }))
      .sort((left, right) => this.toMinutes(left.startTime) - this.toMinutes(right.startTime));
  }

  private buildGroupColorMap(groups: ApiStudentGroup[]): Map<number, string> {
    const uniqueGroups = [...groups].sort((left, right) => {
      const codeCompare = (left.codigo ?? '').localeCompare(right.codigo ?? '');

      if (codeCompare !== 0) {
        return codeCompare;
      }

      return left.id - right.id;
    });

    return new Map(
      uniqueGroups.map((group, index) => [group.id, this.classColors[index % this.classColors.length]])
    );
  }

  private buildTimeSlots(groups: ApiStudentGroup[]): string[] {
    const assignedGroups = groups.filter((group) => group.hora_inicio && group.hora_fin);

    if (assignedGroups.length === 0) {
      return ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
    }

    const firstMinutes = Math.min(...assignedGroups.map((group) => this.toMinutes(this.normalizeTime(group.hora_inicio))));
    const lastMinutes = Math.max(...assignedGroups.map((group) => this.toMinutes(this.normalizeTime(group.hora_fin))));
    const startMinutes = Math.max(0, Math.floor(firstMinutes / 60) * 60);
    const endMinutes = Math.ceil(lastMinutes / 60) * 60;
    const slots: string[] = [];

    for (let current = startMinutes; current <= endMinutes; current += 60) {
      slots.push(this.minutesToTime(current));
    }

    return slots;
  }

  private getCurrentWeekDates(): string[] {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    return this.weekDayOrder.map((_, index) => {
      const current = new Date(monday);
      current.setDate(monday.getDate() + index);
      return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'short',
      }).format(current);
    });
  }

  private normalizeTime(value: string | null): string {
    return value ? value.slice(0, 5) : '';
  }

  private formatClassroom(group: ApiStudentGroup): string {
    if (!group.aula) {
      return 'Aula no asignada';
    }

    return `${group.aula.edificio} • ${group.aula.numero}`;
  }

  private toMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map((item) => Number(item));
    return (hours * 60) + minutes;
  }

  private minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private getApiErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    return 'No se pudo cargar el horario del alumno con las asignaciones actuales.';
  }
}
