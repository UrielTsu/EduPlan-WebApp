import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
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
}

interface ApiEstudiante {
  usuario: ApiUser;
  grupos?: ApiStudentGroup[];
}

interface ApiTarea {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_entrega: string;
  grupo?: {
    id: number;
    codigo: string;
    materia: string;
    semestre: string;
  };
}

interface TaskDetail {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  courseId: string;
  dueDate: string;
  dueTime: string;
  assignedDate: string;
  color: string;
  description: string;
  instructions: string[];
}

@Component({
  selector: 'tareas-d',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatCardModule, MatButtonModule, MatDividerModule],
  templateUrl: './tareas-d.html',
  styleUrls: ['./tareas-d.scss']
})
export class TareasD implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly taskColors = ['blue', 'purple', 'green', 'orange', 'red'];

  task = signal<TaskDetail | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  daysUntil = computed(() => {
    const data = this.task();
    if (!data) return 0;
    const today = new Date();
    const due = new Date(data.dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  });

  isOverdue = computed(() => this.daysUntil() < 0);
  isDueSoon = computed(() => this.daysUntil() >= 0 && this.daysUntil() <= 3);

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (!taskId) {
      this.errorMessage.set('No se encontró la tarea solicitada.');
      this.isLoading.set(false);
      return;
    }

    forkJoin({
      user: this.authService.getCurrentUser(),
      estudiantes: this.adminService.getEstudiantes(),
      tareas: this.adminService.getTareasCurso(),
    }).subscribe({
      next: ({ user, estudiantes, tareas }) => {
        const student = (estudiantes as unknown as ApiEstudiante[]).find((item) => item.usuario?.id === user.id);
        const allowedGroupIds = new Set((student?.grupos ?? []).map((group) => group.id));
        const availableTasks = (tareas as unknown as ApiTarea[])
          .filter((task) => task.grupo?.id && allowedGroupIds.has(task.grupo.id));
        const task = availableTasks.find((item) => String(item.id) === taskId);

        if (!task) {
          this.errorMessage.set('La tarea no está disponible para el alumno autenticado.');
          this.isLoading.set(false);
          return;
        }

        const color = this.taskColors[availableTasks.findIndex((item) => item.id === task.id) % this.taskColors.length] || this.taskColors[0];
        this.task.set({
          id: String(task.id),
          title: task.titulo,
          course: task.grupo?.materia ?? 'Curso no disponible',
          courseCode: task.grupo?.codigo ?? 'SIN-COD',
          courseId: String(task.grupo?.id ?? ''),
          dueDate: task.fecha_entrega,
          dueTime: '23:59',
          assignedDate: task.fecha_entrega,
          color,
          description: task.descripcion || 'Sin descripción adicional.',
          instructions: task.descripcion
            ? task.descripcion.split(/\r?\n+/).map((line) => line.trim()).filter(Boolean)
            : ['Consulta la descripción general y sigue las indicaciones dadas por el profesor.'],
        });
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getApiErrorMessage(error));
        this.isLoading.set(false);
      }
    });
  }

  private getApiErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    return 'No se pudo cargar el detalle de la tarea.';
  }
}
