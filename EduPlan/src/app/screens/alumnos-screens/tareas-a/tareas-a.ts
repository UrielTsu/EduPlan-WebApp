import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

interface Task {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  dueDate: string;
  dueTime: string;
  description: string;
  color: string;
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

@Component({
  selector: 'tareas-a',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './tareas-a.html',
  styleUrls: ['./tareas-a.scss']
})
export class TareasA implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly taskColors = ['blue', 'purple', 'green', 'orange', 'red'];

  filterStatus = signal<'all' | 'pending'>('all');
  isLoading = signal(true);
  errorMessage = signal('');
  tasks = signal<Task[]>([]);

  filteredTasks = computed(() => this.tasks());
  pendingCount = computed(() => this.tasks().length);
  courseCount = computed(() => new Set(this.tasks().map((task) => task.courseCode)).size);

  ngOnInit(): void {
    forkJoin({
      user: this.authService.getCurrentUser(),
      estudiantes: this.adminService.getEstudiantes(),
      tareas: this.adminService.getTareasCurso(),
    }).subscribe({
      next: ({ user, estudiantes, tareas }) => {
        const student = (estudiantes as unknown as ApiEstudiante[]).find((item) => item.usuario?.id === user.id);
        const allowedGroupIds = new Set((student?.grupos ?? []).map((group) => group.id));
        const filteredTasks = (tareas as unknown as ApiTarea[])
          .filter((task) => task.grupo?.id && allowedGroupIds.has(task.grupo.id))
          .sort((left, right) => left.fecha_entrega.localeCompare(right.fecha_entrega));

        this.tasks.set(filteredTasks.map((task, index) => ({
          id: String(task.id),
          title: task.titulo,
          course: task.grupo?.materia ?? 'Curso no disponible',
          courseCode: task.grupo?.codigo ?? 'SIN-COD',
          dueDate: task.fecha_entrega,
          dueTime: '23:59',
          description: task.descripcion || 'Sin descripción adicional.',
          color: this.taskColors[index % this.taskColors.length],
        })));
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

    return 'No se pudieron cargar las tareas asignadas al alumno.';
  }
}
