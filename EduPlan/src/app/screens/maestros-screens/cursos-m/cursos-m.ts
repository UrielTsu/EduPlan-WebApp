import { Component, Inject, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { TareaCursoCreate, TareaCursoUpdate } from '../../../models/admin.models';
import { ActualizarScreen } from '../../../modals/actualizar-screen/actualizar-screen';
import { EliminarScreen } from '../../../modals/eliminar-screen/eliminar-screen';

interface Course {
  id: number;
  name: string;
  code: string;
  schedule: string;
  students: number;
  semester: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

interface TaskFormValue {
  title: string;
  description: string;
  dueDate: string;
}

interface TaskItem {
  id: number;
  courseId: number;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
}

interface PendingTaskUpdateConfirmation {
  taskId: number;
  courseName: string;
  title: string;
  formValue: TaskFormValue;
}

interface PendingTaskDeleteConfirmation {
  taskId: number;
  courseName: string;
  title: string;
}

interface ApiTareaCurso {
  id: number;
  grupo: {
    id: number;
    codigo: string;
    materia: string;
    semestre: string;
  };
  titulo: string;
  descripcion: string;
  fecha_entrega: string;
  creation: string;
}

@Component({
  selector: 'app-task-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="course-task-modal-shell admin-form-modal">
      <div class="modal-header">
        <div>
          <h2>{{ data.mode === 'create' ? 'Nueva Tarea' : 'Editar Tarea' }}</h2>
          <p>{{ data.courseName }}</p>
        </div>
        <button type="button" class="close-btn" (click)="onCancel()" aria-label="Cerrar modal">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="modal-body course-task-modal-content">
        <form [formGroup]="taskForm" class="course-task-form-grid">
          <label class="form-group course-task-field">
            <span>Título</span>
            <input type="text" formControlName="title" placeholder="Ej. Práctica de Herencia">
          </label>

          <label class="form-group course-task-field">
            <span>Fecha de Entrega</span>
            <input type="date" formControlName="dueDate">
          </label>

          <label class="form-group course-task-field course-task-field-full">
            <span>Descripción</span>
            <textarea formControlName="description" rows="4" placeholder="Indicaciones de la tarea"></textarea>
          </label>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="modal-footer course-task-modal-actions" align="end">
        <button type="button" class="cancel-btn" (click)="onCancel()">Cancelar</button>
        <button type="button" class="save-btn course-task-submit-btn" (click)="onSubmit()" [disabled]="taskForm.invalid">
          {{ data.mode === 'create' ? 'Guardar' : 'Actualizar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .course-task-dialog-panel .mat-mdc-dialog-surface {
      padding: 0 !important;
      border-radius: 14px !important;
      overflow: hidden !important;
      background: #ffffff !important;
      box-shadow: 0 16px 36px rgba(15, 23, 42, 0.24) !important;
    }

    .admin-form-modal {
      width: min(520px, 100%);
      background: #ffffff;
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      gap: 16px;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.8rem;
      color: #0b2347;
      font-weight: 700;
    }

    .modal-header p {
      margin: 4px 0 0;
      color: #334155;
      font-size: 1rem;
    }

    .close-btn {
      border: none;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: transparent;
      color: #64748b;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .modal-body {
      padding: 20px 24px;
      display: grid;
      gap: 16px;
    }

    .course-task-form-grid {
      display: grid;
      gap: 16px;
    }

    .form-group {
      display: grid;
      gap: 8px;
    }

    .form-group span {
      font-size: 1rem;
      font-weight: 600;
      color: #0f172a;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      min-height: 50px;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 0 14px;
      color: #0f172a;
      font-size: 1rem;
      outline: none;
    }

    .form-group textarea {
      min-height: 110px;
      padding: 12px 14px;
      resize: vertical;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      border-color: #93c5fd;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .modal-footer {
      border-top: 1px solid #e2e8f0;
      padding: 14px 24px 18px !important;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .cancel-btn,
    .save-btn {
      border: none;
      border-radius: 10px;
      min-height: 40px;
      padding: 0 16px;
      font-size: 0.95rem;
      font-weight: 600;
    }

    .cancel-btn {
      background: #e2e8f0;
      color: #334155;
    }

    .save-btn {
      background: #16a34a;
      color: #ffffff;
    }

    .course-task-submit-btn:disabled,
    .save-btn:disabled,
    .cancel-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `]
})
export class TaskFormModalComponent {
  taskForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<TaskFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: {
      mode: 'create' | 'edit';
      courseName: string;
      task?: TaskItem;
    }
  ) {
    this.taskForm = this.fb.group({
      title: [data.task?.title ?? '', Validators.required],
      description: [data.task?.description ?? '', Validators.required],
      dueDate: [data.task?.dueDate ?? '', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.dialogRef.close(this.taskForm.getRawValue() as TaskFormValue);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
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

@Component({
  selector: 'app-cursos-m',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    ActualizarScreen,
    EliminarScreen
  ],
  templateUrl: './cursos-m.html',
  styleUrls: ['./cursos-m.scss']
})
export class CursosM {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly dayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  private readonly courseColors: Array<Course['color']> = ['blue', 'purple', 'green', 'orange'];

  selectedCourseId = signal<number | null>(null);
  teacherName = signal('');
  courses = signal<Course[]>([]);
  tasks = signal<TaskItem[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal('');
  pendingTaskUpdateConfirmation = signal<PendingTaskUpdateConfirmation | null>(null);
  pendingTaskDeleteConfirmation = signal<PendingTaskDeleteConfirmation | null>(null);

  totalStudentsCount = computed(() => this.courses().reduce((sum, course) => sum + course.students, 0));
  totalTasks = computed(() => this.tasks().length);
  selectedCourseData = computed(() => this.courses().find((course) => course.id === this.selectedCourseId()) ?? null);
  selectedCourseTasks = computed(() => this.tasks().filter((task) => task.courseId === this.selectedCourseId()));

  constructor() {
    this.loadCourses();
  }

  selectCourse(id: number): void {
    this.selectedCourseId.update((current) => current === id ? null : id);
  }

  private loadCourses(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      user: this.authService.getCurrentUser(),
      groups: this.adminService.getGrupos(),
      tasks: this.adminService.getTareasCurso()
    }).subscribe({
      next: ({ user, groups, tasks }) => {
        this.teacherName.set(user.fullName || user.email);
        const normalizedTeacher = this.normalizeText(user.fullName || user.email);
        const mappedCourses = (groups as unknown as ApiGrupo[])
          .filter((group) => {
            const teacherName = this.normalizeText(group.docente);
            return !teacherName || teacherName === normalizedTeacher;
          })
          .map((group, index) => this.mapApiGroupToCourse(group, index));

        this.courses.set(mappedCourses);
        this.tasks.set((tasks as unknown as ApiTareaCurso[]).map((task) => this.mapApiTaskToTaskItem(task)));
        this.selectedCourseId.set(mappedCourses[0]?.id ?? null);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getApiErrorMessage(error));
        this.courses.set([]);
        this.tasks.set([]);
        this.selectedCourseId.set(null);
        this.isLoading.set(false);
      }
    });
  }

  private mapApiGroupToCourse(group: ApiGrupo, index: number): Course {
    return {
      id: group.id,
      name: group.materia,
      code: group.codigo,
      schedule: this.formatSchedule(group),
      students: this.getGroupStudentCount(group),
      semester: group.semestre,
      color: this.courseColors[index % this.courseColors.length]
    };
  }

  private mapApiTaskToTaskItem(task: ApiTareaCurso): TaskItem {
    return {
      id: task.id,
      courseId: task.grupo.id,
      title: task.titulo,
      description: task.descripcion,
      dueDate: task.fecha_entrega,
      createdAt: task.creation
    };
  }

  openCreateTaskModal(): void {
    const course = this.selectedCourseData();
    if (!course || this.isSubmitting()) {
      return;
    }

    const dialogRef = this.dialog.open(TaskFormModalComponent, {
      width: '520px',
      maxWidth: 'calc(100vw - 1.5rem)',
      panelClass: 'course-task-dialog-panel',
      autoFocus: false,
      data: {
        mode: 'create',
        courseName: course.name,
      }
    });

    dialogRef.afterClosed().subscribe((result?: TaskFormValue) => {
      if (result) {
        this.createTask(course.id, result);
      }
    });
  }

  openEditTaskModal(task: TaskItem): void {
    const course = this.selectedCourseData();
    if (!course || this.isSubmitting()) {
      return;
    }

    const dialogRef = this.dialog.open(TaskFormModalComponent, {
      width: '520px',
      maxWidth: 'calc(100vw - 1.5rem)',
      panelClass: 'course-task-dialog-panel',
      autoFocus: false,
      data: {
        mode: 'edit',
        courseName: course.name,
        task,
      }
    });

    dialogRef.afterClosed().subscribe((result?: TaskFormValue) => {
      if (result) {
        this.pendingTaskUpdateConfirmation.set({
          taskId: task.id,
          courseName: course.name,
          title: result.title.trim() || task.title,
          formValue: result,
        });
      }
    });
  }

  openDeleteTaskModal(task: TaskItem): void {
    if (this.isSubmitting()) {
      return;
    }

    const course = this.selectedCourseData();
    this.pendingTaskDeleteConfirmation.set({
      taskId: task.id,
      title: task.title,
      courseName: course?.name ?? 'Curso seleccionado'
    });
  }

  cancelTaskUpdateConfirmation(): void {
    this.pendingTaskUpdateConfirmation.set(null);
  }

  confirmTaskUpdateConfirmation(): void {
    const pending = this.pendingTaskUpdateConfirmation();
    if (!pending) {
      return;
    }

    this.pendingTaskUpdateConfirmation.set(null);
    this.updateTask(pending.taskId, pending.formValue);
  }

  cancelTaskDeleteConfirmation(): void {
    this.pendingTaskDeleteConfirmation.set(null);
  }

  confirmTaskDeleteConfirmation(): void {
    const pending = this.pendingTaskDeleteConfirmation();
    if (!pending) {
      return;
    }

    this.pendingTaskDeleteConfirmation.set(null);
    this.deleteTask(pending.taskId);
  }

  private createTask(courseId: number, formValue: TaskFormValue): void {
    this.isSubmitting.set(true);
    const payload = {
      grupoId: courseId,
      titulo: formValue.title.trim(),
      descripcion: formValue.description.trim(),
      fechaEntrega: formValue.dueDate,
    };

    this.adminService.createTareaCurso(this.mapTaskPayload(payload) as unknown as TareaCursoCreate).subscribe({
      next: (task) => {
        this.tasks.update((items) => [...items, this.mapApiTaskToTaskItem(task as unknown as ApiTareaCurso)]);
        this.isSubmitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getApiErrorMessage(error));
        this.isSubmitting.set(false);
      }
    });
  }

  private updateTask(taskId: number, formValue: TaskFormValue): void {
    this.isSubmitting.set(true);
    const payload = {
      titulo: formValue.title.trim(),
      descripcion: formValue.description.trim(),
      fechaEntrega: formValue.dueDate,
    };

    this.adminService.updateTareaCurso(taskId, this.mapTaskPayload(payload) as unknown as TareaCursoUpdate).subscribe({
      next: (task) => {
        const mapped = this.mapApiTaskToTaskItem(task as unknown as ApiTareaCurso);
        this.tasks.update((items) => items.map((item) => item.id === taskId ? mapped : item));
        this.isSubmitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getApiErrorMessage(error));
        this.isSubmitting.set(false);
      }
    });
  }

  private deleteTask(taskId: number): void {
    this.isSubmitting.set(true);
    this.adminService.deleteTareaCurso(taskId).subscribe({
      next: () => {
        this.tasks.update((items) => items.filter((item) => item.id !== taskId));
        this.isSubmitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getApiErrorMessage(error));
        this.isSubmitting.set(false);
      }
    });
  }

  getTaskCount(courseId: number): number {
    return this.tasks().filter((task) => task.courseId === courseId).length;
  }

  private mapTaskPayload(payload: Record<string, unknown>): Record<string, unknown> {
    const mapped: Record<string, unknown> = {};

    if ('grupoId' in payload) {
      mapped['grupo_id'] = payload['grupoId'];
    }
    if ('titulo' in payload) {
      mapped['titulo'] = payload['titulo'];
    }
    if ('descripcion' in payload) {
      mapped['descripcion'] = payload['descripcion'];
    }
    if ('fechaEntrega' in payload) {
      mapped['fecha_entrega'] = payload['fechaEntrega'];
    }

    return mapped;
  }

  private formatSchedule(group: ApiGrupo): string {
    const days = this.normalizeGroupDays(group.dia_semana);
    const startTime = this.normalizeApiTime(group.hora_inicio);
    const endTime = this.normalizeApiTime(group.hora_fin);
    const daysLabel = days.length > 0 ? days.join(', ') : 'Sin días registrados';

    if (!startTime || !endTime) {
      return daysLabel;
    }

    return `${daysLabel} · ${startTime}-${endTime}`;
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

    return 'No fue posible cargar los cursos del maestro.';
  }
}
