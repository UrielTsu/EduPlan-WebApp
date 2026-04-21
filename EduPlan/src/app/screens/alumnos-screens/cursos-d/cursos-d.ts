import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
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

interface ApiMateria {
  nombre: string;
  codigo: string;
  creditos: number;
  area_academica: string;
}

interface ApiTarea {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_entrega: string;
}

interface CourseTask {
  id: number;
  title: string;
  description: string;
  dueDate: string;
}

interface CourseDetail {
  id: number;
  name: string;
  code: string;
  professor: string;
  professorEmail: string;
  schedule: string;
  classroom: string;
  students: number;
  maxStudents: number;
  semester: string;
  credits: number;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'red';
  area: string;
  description: string;
  days: string[];
  upcomingTasks: CourseTask[];
}

@Component({
  selector: 'app-cursos-d',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './cursos-d.html',
  styleUrls: ['./cursos-d.scss']
})
export class CursosD implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly courseColors: CourseDetail['color'][] = ['blue', 'purple', 'green', 'orange', 'red'];

  course = signal<CourseDetail | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const groupId = rawId ? Number(rawId) : NaN;

    if (!Number.isFinite(groupId)) {
      this.errorMessage.set('No se encontró el curso solicitado.');
      this.isLoading.set(false);
      return;
    }

    forkJoin({
      user: this.authService.getCurrentUser(),
      estudiantes: this.adminService.getEstudiantes(),
      materias: this.adminService.getMaterias(),
      tareas: this.adminService.getTareasCurso(groupId),
    }).subscribe({
      next: ({ user, estudiantes, materias, tareas }) => {
        const student = (estudiantes as unknown as ApiEstudiante[]).find((item) => item.usuario?.id === user.id);
        const group = student?.grupos?.find((item) => item.id === groupId);

        if (!group) {
          this.errorMessage.set('Este curso no está asociado al alumno autenticado.');
          this.isLoading.set(false);
          return;
        }

        const materia = (materias as unknown as ApiMateria[]).find((item) => item.nombre === group.materia);
        const color = this.getCourseColor(group.id);

        this.course.set({
          id: group.id,
          name: group.materia,
          code: group.codigo || materia?.codigo || `GRP-${group.id}`,
          professor: group.docente || 'Docente por asignar',
          professorEmail: this.buildProfessorEmail(group.docente),
          schedule: this.formatSchedule(group),
          classroom: this.formatClassroom(group),
          students: group.inscritos,
          maxStudents: group.cupo_max,
          semester: group.semestre,
          credits: materia?.creditos ?? 0,
          color,
          area: materia?.area_academica ?? 'Sin área registrada',
          description: `Grupo ${group.codigo} inscrito por el alumno. La información académica y las tareas activas se muestran con base en la asignación real del curso.`,
          days: group.dia_semana ?? [],
          upcomingTasks: (tareas as unknown as ApiTarea[]).map((task) => ({
            id: task.id,
            title: task.titulo,
            description: task.descripcion,
            dueDate: task.fecha_entrega,
          })),
        });
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getApiErrorMessage(error));
        this.isLoading.set(false);
      }
    });
  }

  private formatSchedule(group: ApiStudentGroup): string {
    const days = (group.dia_semana ?? []).join(', ');
    const start = this.normalizeTime(group.hora_inicio);
    const end = this.normalizeTime(group.hora_fin);
    const timeRange = start && end ? `${start} - ${end}` : 'Horario pendiente';

    return [days, timeRange].filter(Boolean).join(' • ');
  }

  private buildProfessorEmail(name: string): string {
    const cleanName = (name ?? '').trim().toLowerCase();

    if (!cleanName) {
      return 'No registrado';
    }

    return `${cleanName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z\s]/g, '').trim().replace(/\s+/g, '.')}@universidad.edu`;
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

  private getCourseColor(groupId: number): CourseDetail['color'] {
    const normalizedIndex = Math.abs(groupId - 1) % this.courseColors.length;
    return this.courseColors[normalizedIndex];
  }

  private getApiErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    return 'No se pudo cargar el detalle del curso.';
  }
}
