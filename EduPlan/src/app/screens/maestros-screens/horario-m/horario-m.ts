import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

type ScheduleColor = 'purple' | 'blue' | 'green' | 'orange';

interface ScheduleClass {
  id: string;
  subject: string;
  group: string;
  semester: string;
  room: string;
  startTime: string;
  endTime: string;
  color: ScheduleColor;
  overlapColumn: number;
  overlapCount: number;
}

interface DaySchedule {
  day: string;
  classes: ScheduleClass[];
}

interface ApiGrupo {
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
  dia_semana: string[] | string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
}

@Component({
  selector: 'horario-m',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule],
  templateUrl: './horario-m.html',
  styleUrls: ['./horario-m.scss']
})
export class TeacherScheduleComponent {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);
  private readonly dayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  private readonly classColors: ScheduleColor[] = ['purple', 'blue', 'green', 'orange'];

  teacherName = signal('');
  isLoading = signal(true);
  errorMessage = signal('');
  weekSchedule = signal<DaySchedule[]>(this.createEmptyWeekSchedule());

  readonly hasClasses = computed(() => this.weekSchedule().some((day) => day.classes.length > 0));
  readonly timeSlots = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  constructor() {
    this.loadSchedule();
  }

  getClassPosition(classItem: ScheduleClass) {
    const startHour = parseInt(classItem.startTime.split(':')[0]);
    const startMinute = parseInt(classItem.startTime.split(':')[1]);
    const endHour = parseInt(classItem.endTime.split(':')[0]);
    const endMinute = parseInt(classItem.endTime.split(':')[1]);
    const baseHour = parseInt(this.timeSlots[0].split(':')[0]);
    const horizontalGap = 6;
    const overlapCount = Math.max(classItem.overlapCount, 1);
    const widthPercent = 100 / overlapCount;

    const startPosition = (startHour - baseHour) * 60 + startMinute;
    const duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    const rawHeight = (duration / 60) * 64 + 8;
    const clampedHeight = Math.max(Math.min(rawHeight, 176), 108);

    return {
      'top.px': (startPosition / 60) * 64,
      'height.px': clampedHeight,
      left: `calc(${widthPercent * classItem.overlapColumn}% + ${horizontalGap / 2}px)`,
      width: `calc(${widthPercent}% - ${horizontalGap}px)`
    };
  }

  isCompactClass(classItem: ScheduleClass): boolean {
    return classItem.overlapCount > 1;
  }

  shouldDisplayRoom(classItem: ScheduleClass): boolean {
    return !!classItem.room && classItem.room.trim().toLowerCase() !== 'aula no asignada';
  }

  getSemesterLabel(classItem: ScheduleClass): string {
    if (!this.isCompactClass(classItem)) {
      return classItem.semester;
    }

    return classItem.semester
      .replace(' semestre', ' sem.')
      .replace('Semestre', 'Sem.');
  }

  private loadSchedule(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      user: this.authService.getCurrentUser(),
      groups: this.adminService.getGrupos()
    }).subscribe({
      next: ({ user, groups }) => {
        this.teacherName.set(user.fullName || user.email);
        const normalizedTeacher = this.normalizeText(user.fullName || user.email);
        const filteredGroups = (groups as unknown as ApiGrupo[]).filter((group) => {
          const teacherName = this.normalizeText(group.docente);
          return !teacherName || teacherName === normalizedTeacher;
        });

        this.weekSchedule.set(this.buildWeekSchedule(filteredGroups));
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getApiErrorMessage(error));
        this.weekSchedule.set(this.createEmptyWeekSchedule());
        this.isLoading.set(false);
      }
    });
  }

  private buildWeekSchedule(groups: ApiGrupo[]): DaySchedule[] {
    const scheduleMap = new Map<string, ScheduleClass[]>();
    this.dayOrder.forEach((day) => scheduleMap.set(day, []));

    groups.forEach((group, groupIndex) => {
      const days = this.normalizeGroupDays(group.dia_semana);
      const startTime = this.normalizeApiTime(group.hora_inicio);
      const endTime = this.normalizeApiTime(group.hora_fin);

      if (days.length === 0 || !startTime || !endTime) {
        return;
      }

      days.forEach((day, dayIndex) => {
        const dayClasses = scheduleMap.get(day);
        if (!dayClasses) {
          return;
        }

        dayClasses.push({
          id: `${group.id}-${dayIndex}`,
          subject: group.materia,
          group: group.codigo,
          semester: group.semestre,
          room: this.formatClassroom(group),
          startTime,
          endTime,
          color: this.classColors[groupIndex % this.classColors.length],
          overlapColumn: 0,
          overlapCount: 1
        });
      });
    });

    return this.dayOrder.map((day) => ({
      day,
      classes: this.applyOverlapLayout(
        (scheduleMap.get(day) ?? []).sort((left, right) => left.startTime.localeCompare(right.startTime))
      )
    }));
  }

  private applyOverlapLayout(classes: ScheduleClass[]): ScheduleClass[] {
    if (classes.length <= 1) {
      return classes;
    }

    const clusters: ScheduleClass[][] = [];
    let currentCluster: ScheduleClass[] = [];
    let currentClusterEnd = -1;

    classes.forEach((classItem) => {
      const start = this.timeToMinutes(classItem.startTime);
      const end = this.timeToMinutes(classItem.endTime);

      if (currentCluster.length === 0 || start < currentClusterEnd) {
        currentCluster.push(classItem);
        currentClusterEnd = Math.max(currentClusterEnd, end);
        return;
      }

      clusters.push(currentCluster);
      currentCluster = [classItem];
      currentClusterEnd = end;
    });

    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    return clusters.flatMap((cluster) => this.layoutCluster(cluster));
  }

  private layoutCluster(cluster: ScheduleClass[]): ScheduleClass[] {
    if (cluster.length === 1) {
      return cluster.map((classItem) => ({
        ...classItem,
        overlapColumn: 0,
        overlapCount: 1
      }));
    }

    const active: Array<{ end: number; column: number }> = [];
    let maxColumns = 1;

    const laidOut = cluster.map((classItem) => {
      const start = this.timeToMinutes(classItem.startTime);
      const end = this.timeToMinutes(classItem.endTime);

      for (let index = active.length - 1; index >= 0; index -= 1) {
        if (active[index].end <= start) {
          active.splice(index, 1);
        }
      }

      const usedColumns = new Set(active.map((item) => item.column));
      let assignedColumn = 0;
      while (usedColumns.has(assignedColumn)) {
        assignedColumn += 1;
      }

      active.push({ end, column: assignedColumn });
      maxColumns = Math.max(maxColumns, active.length);

      return {
        ...classItem,
        overlapColumn: assignedColumn,
        overlapCount: 1
      };
    });

    return laidOut.map((classItem) => ({
      ...classItem,
      overlapCount: maxColumns
    }));
  }

  private createEmptyWeekSchedule(): DaySchedule[] {
    return this.dayOrder.map((day) => ({ day, classes: [] }));
  }

  private normalizeApiTime(time: string | null | undefined): string {
    if (!time) {
      return '';
    }

    return time.slice(0, 5);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map((value) => Number(value));
    return hours * 60 + minutes;
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

  private normalizeText(value: string | null | undefined): string {
    return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
  }

  private formatClassroom(group: ApiGrupo): string {
    if (!group.aula) {
      return 'Aula no asignada';
    }

    return `${group.aula.edificio} • ${group.aula.numero}`;
  }

  private getApiErrorMessage(error: HttpErrorResponse): string {
    const payload = error.error as Record<string, unknown> | string | undefined;

    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }

    if (
      payload &&
      typeof payload === 'object' &&
      typeof payload['message'] === 'string' &&
      payload['message'].trim()
    ) {
      return payload['message'];
    }

    return 'No fue posible cargar el horario del docente.';
  }
}
