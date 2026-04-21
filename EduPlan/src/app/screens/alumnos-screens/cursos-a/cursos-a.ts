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

interface ApiMateria {
  id: number;
  nombre: string;
  codigo: string;
  creditos: number;
}

interface Course {
  id: number;
  name: string;
  code: string;
  professor: string;
  schedule: string;
  students: number;
  maxStudents: number;
  semester: string;
  credits: number;
  color: string;
  progress: number;
  nextClass: string;
}

@Component({
  selector: 'app-cursos-a',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatCardModule, MatButtonModule],
  templateUrl: './cursos-a.html',
  styleUrls: ['./cursos-a.scss']
})
export class CursosA {
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly courseColors: Course['color'][] = ['blue', 'purple', 'green', 'orange', 'red'];

  courses = signal<Course[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  totalCredits = computed(() =>
    this.courses().reduce((sum, course) => sum + course.credits, 0)
  );

  ngOnInit(): void {
    forkJoin({
      user: this.authService.getCurrentUser(),
      estudiantes: this.adminService.getEstudiantes(),
      materias: this.adminService.getMaterias(),
    }).subscribe({
      next: ({ user, estudiantes, materias }) => {
        const student = (estudiantes as unknown as ApiEstudiante[]).find((item) => item.usuario?.id === user.id);
        const materiasMap = new Map((materias as unknown as ApiMateria[]).map((materia) => [materia.nombre, materia]));
        const groups = student?.grupos ?? [];

        this.courses.set(groups.map((group) => {
          const materia = materiasMap.get(group.materia);

          return {
            id: group.id,
            name: group.materia,
            code: group.codigo || materia?.codigo || `GRP-${group.id}`,
            professor: group.docente || 'Docente por asignar',
            schedule: this.formatSchedule(group),
            students: group.inscritos,
            maxStudents: group.cupo_max,
            semester: group.semestre,
            credits: materia?.creditos ?? 0,
            color: this.getCourseColor(group.id),
            progress: group.cupo_max > 0 ? Math.round((group.inscritos / group.cupo_max) * 100) : 0,
            nextClass: this.formatNextClass(group),
          };
        }));

        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getApiErrorMessage(error));
        this.isLoading.set(false);
      }
    });
  }

  private formatSchedule(group: ApiStudentGroup): string {
    const days = (group.dia_semana ?? []).map((day) => this.shortDay(day));
    const timeRange = this.formatTimeRange(group.hora_inicio, group.hora_fin);

    if (days.length === 0 && !timeRange) {
      return 'Horario no disponible';
    }

    if (days.length === 0) {
      return timeRange;
    }

    return `${days.join(', ')} ${timeRange}`.trim();
  }

  private formatNextClass(group: ApiStudentGroup): string {
    const firstDay = group.dia_semana?.[0];
    const startTime = this.normalizeTime(group.hora_inicio);

    if (!firstDay && !startTime) {
      return 'Sin próxima clase registrada';
    }

    return [firstDay, startTime].filter(Boolean).join(' ');
  }

  private formatTimeRange(start: string | null, end: string | null): string {
    const startTime = this.normalizeTime(start);
    const endTime = this.normalizeTime(end);

    if (!startTime || !endTime) {
      return '';
    }

    return `${startTime}-${endTime}`;
  }

  private normalizeTime(value: string | null): string {
    return value ? value.slice(0, 5) : '';
  }

  private shortDay(day: string): string {
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

  private getCourseColor(groupId: number): Course['color'] {
    const normalizedIndex = Math.abs(groupId - 1) % this.courseColors.length;
    return this.courseColors[normalizedIndex];
  }

  private getApiErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    return 'No se pudieron cargar los cursos inscritos del alumno.';
  }
}
