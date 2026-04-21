import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

interface Subject {
  id: string;
  name: string;
  time: string;
  room: string;
  teacher: string;
  dayLabel: string;
}

interface ScheduleItem {
  id: string;
  time: string;
  subject: string;
  room: string;
  teacher: string;
  groupCode: string;
  startTime: string;
  endTime: string;
}

interface CurrentClass {
  subject: string;
  room: string;
  teacher: string;
  time: string;
  badge: string;
}

interface WeekDay {
  id: number;
  name: string;
  date: string;
  fullName: string;
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
}

interface ApiEstudiante {
  usuario: ApiUser;
  grupos?: ApiStudentGroup[];
}

@Component({
  selector: 'app-dashboard-alumno',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './dashboard-alumno.html',
  styleUrls: ['./dashboard-alumno.scss']
})
export class DashboardAlumno implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly weekDayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  readonly selectedDay = signal(0);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly weekDays = signal<WeekDay[]>([]);
  readonly scheduleByDay = signal<Record<number, ScheduleItem[]>>({});
  readonly upcomingSubjects = signal<Subject[]>([]);
  readonly currentClass = signal<CurrentClass | null>(null);

  readonly currentDaySchedule = computed(() => this.scheduleByDay()[this.selectedDay()] || []);

  ngOnInit(): void {
    forkJoin({
      user: this.authService.getCurrentUser(),
      estudiantes: this.adminService.getEstudiantes(),
    }).subscribe({
      next: ({ user, estudiantes }) => {
        const student = (estudiantes as unknown as ApiEstudiante[]).find((item) => item.usuario?.id === user.id);
        const groups = student?.grupos ?? [];
        const weekDays = this.buildWeekDays();
        const scheduleByDay = this.buildScheduleByDay(groups);

        this.weekDays.set(weekDays);
        this.scheduleByDay.set(scheduleByDay);
        this.selectedDay.set(this.getTodayTab(weekDays));
        this.currentClass.set(this.buildCurrentClass(scheduleByDay, weekDays));
        this.upcomingSubjects.set(this.buildUpcomingSubjects(scheduleByDay, weekDays));
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getApiErrorMessage(error));
        this.isLoading.set(false);
      }
    });
  }

  selectDay(id: number): void {
    this.selectedDay.set(id);
  }

  private buildWeekDays(): WeekDay[] {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    return this.weekDayOrder.map((fullName, index) => {
      const current = new Date(monday);
      current.setDate(monday.getDate() + index);

      return {
        id: index,
        name: this.getShortDayName(fullName),
        date: new Intl.DateTimeFormat('es-MX', { day: '2-digit' }).format(current),
        fullName,
      };
    });
  }

  private buildScheduleByDay(groups: ApiStudentGroup[]): Record<number, ScheduleItem[]> {
    const result: Record<number, ScheduleItem[]> = {};

    this.weekDayOrder.forEach((day, index) => {
      result[index] = groups
        .filter((group) => (group.dia_semana ?? []).includes(day) && group.hora_inicio && group.hora_fin)
        .map((group) => ({
          id: `${group.id}-${day}`,
          time: `${this.normalizeTime(group.hora_inicio)} - ${this.normalizeTime(group.hora_fin)}`,
          subject: group.materia,
          room: this.formatClassroom(group),
          teacher: group.docente || 'Docente por asignar',
          groupCode: group.codigo,
          startTime: this.normalizeTime(group.hora_inicio),
          endTime: this.normalizeTime(group.hora_fin),
        }))
        .sort((left, right) => this.toMinutes(left.startTime) - this.toMinutes(right.startTime));
    });

    return result;
  }

  private buildCurrentClass(scheduleByDay: Record<number, ScheduleItem[]>, weekDays: WeekDay[]): CurrentClass | null {
    const now = new Date();
    const todayIndex = this.getTodayTab(weekDays);
    const todaySchedule = scheduleByDay[todayIndex] ?? [];
    const currentMinutes = (now.getHours() * 60) + now.getMinutes();

    const currentItem = todaySchedule.find((item) => {
      const start = this.toMinutes(item.startTime);
      const end = this.toMinutes(item.endTime);
      return currentMinutes >= start && currentMinutes < end;
    });

    if (currentItem) {
      return {
        subject: currentItem.subject,
        room: currentItem.room,
        teacher: currentItem.teacher,
        time: currentItem.time,
        badge: 'Clase en curso',
      };
    }

    const nextItem = this.buildUpcomingSubjects(scheduleByDay, weekDays, 1)[0];
    if (!nextItem) {
      return null;
    }

    return {
      subject: nextItem.name,
      room: nextItem.room,
      teacher: nextItem.teacher,
      time: `${nextItem.dayLabel} · ${nextItem.time}`,
      badge: 'Próxima clase',
    };
  }

  private buildUpcomingSubjects(scheduleByDay: Record<number, ScheduleItem[]>, weekDays: WeekDay[], limit = 4): Subject[] {
    const now = new Date();
    const todayIndex = this.getTodayTab(weekDays);
    const currentMinutes = (now.getHours() * 60) + now.getMinutes();
    const flattened = weekDays.flatMap((day) =>
      (scheduleByDay[day.id] ?? []).map((item) => ({
        ...item,
        dayId: day.id,
        dayLabel: day.fullName,
      }))
    );

    return flattened
      .filter((item) => {
        if (item.dayId > todayIndex) {
          return true;
        }

        if (item.dayId < todayIndex) {
          return false;
        }

        return this.toMinutes(item.endTime) > currentMinutes;
      })
      .sort((left, right) => {
        if (left.dayId !== right.dayId) {
          return left.dayId - right.dayId;
        }

        return this.toMinutes(left.startTime) - this.toMinutes(right.startTime);
      })
      .slice(0, limit)
      .map((item) => ({
        id: item.id,
        name: item.subject,
        time: item.time,
        room: item.room,
        teacher: item.teacher,
        dayLabel: item.dayLabel,
      }));
  }

  private getTodayTab(weekDays: WeekDay[]): number {
    const currentDay = new Date().getDay();
    const normalized = currentDay === 0 ? 0 : Math.min(currentDay - 1, weekDays.length - 1);
    return normalized;
  }

  private getShortDayName(day: string): string {
    const dayMap: Record<string, string> = {
      'Lunes': 'Lun',
      'Martes': 'Mar',
      'Miércoles': 'Mié',
      'Jueves': 'Jue',
      'Viernes': 'Vie',
      'Sábado': 'Sáb',
    };

    return dayMap[day] ?? day;
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

  private getApiErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    return 'No se pudo cargar la información del panel del alumno.';
  }
}
