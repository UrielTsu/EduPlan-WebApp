import { Component, Inject, ViewEncapsulation, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AdminService } from '../../../services/admin.service';
import { SolicitudCreate } from '../../../models/admin.models';

interface RequestFormValue {
  type: string;
  classroom: string;
  reason: string;
  information: string;
}

interface ClassroomOption {
  value: string;
  label: string;
}

interface ApiAula {
  id: number;
  edificio: string;
  numero: string;
  estado: string;
}

@Component({
  selector: 'app-request-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="request-modal-shell">
      <div class="request-modal-header">
        <div>
          <h2>Nueva Solicitud</h2>
          <p>Completa los campos para enviar tu solicitud</p>
        </div>

        <button type="button" class="request-close-btn" (click)="onCancel()" aria-label="Cerrar modal">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="request-modal-content">
        <form [formGroup]="requestForm" class="request-form-grid">
          <label class="request-field">
            <span>Tipo de Solicitud</span>
            <select formControlName="type">
              @for (option of requestTypeOptions; track option) {
                <option [value]="option">{{ option }}</option>
              }
            </select>
          </label>

          <label class="request-field">
            <span>Aula / Laboratorio</span>
            <select formControlName="classroom">
              <option value="" disabled>Selecciona un aula registrada</option>
              @for (option of classroomOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </label>

          <label class="request-field">
            <span>Motivo</span>
            <input type="text" formControlName="reason" placeholder="Describe el motivo principal">
          </label>

          <label class="request-field request-field-full">
            <span>Informacion Adicional</span>
            <textarea formControlName="information" rows="4" placeholder="Agrega contexto util para la revision"></textarea>
          </label>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="request-modal-actions" align="end">
        <button type="button" class="request-cancel-btn" (click)="onCancel()">Cancelar</button>
        <button type="button" class="request-submit-btn" (click)="onSubmit()" [disabled]="requestForm.invalid">Enviar Solicitud</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .teacher-request-dialog-panel .mat-mdc-dialog-surface {
      padding: 0 !important;
      border-radius: 14px !important;
      overflow: hidden !important;
      background: #ffffff !important;
      box-shadow: 0 16px 36px rgba(15, 23, 42, 0.24) !important;
    }

    .teacher-request-dialog-panel .mat-mdc-dialog-container .mdc-dialog__surface {
      overflow: hidden !important;
    }

    .request-modal-shell {
      display: block;
      color: #0f172a;
    }

    .request-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
      background: #ffffff;
    }

    .request-modal-header h2 {
      margin: 0;
      font-size: 1.8rem;
      line-height: 1.1;
      font-weight: 700;
      color: #0b2347;
    }

    .request-modal-header p {
      margin: 4px 0 0;
      font-size: 1rem;
      color: #334155;
    }

    .request-close-btn {
      width: 34px;
      height: 34px;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: #64748b;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .request-modal-content {
      padding: 20px 24px 0 !important;
      max-height: none;
    }

    .request-form-grid {
      display: grid;
      gap: 16px;
    }

    .request-field {
      display: grid;
      gap: 8px;
    }

    .request-field span {
      font-size: 1rem;
      font-weight: 600;
      color: #0f172a;
    }

    .request-field input,
    .request-field select,
    .request-field textarea {
      width: 100%;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      background: #ffffff;
      color: #0f172a;
      font-size: 1rem;
      font-family: inherit;
      padding: 0 14px;
      outline: none;
      transition: border-color 0.18s ease, box-shadow 0.18s ease;
    }

    .request-field input,
    .request-field select {
      min-height: 50px;
    }

    .request-field select {
      appearance: none;
      background-image: linear-gradient(45deg, transparent 50%, #94a3b8 50%),
        linear-gradient(135deg, #94a3b8 50%, transparent 50%);
      background-position: calc(100% - 24px) calc(50% - 4px), calc(100% - 16px) calc(50% - 4px);
      background-size: 8px 8px, 8px 8px;
      background-repeat: no-repeat;
      padding-right: 38px;
    }

    .request-field textarea {
      min-height: 110px;
      padding: 12px 14px;
      resize: vertical;
    }

    .request-field input:focus,
    .request-field select:focus,
    .request-field textarea:focus {
      border-color: #93c5fd;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .request-modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 24px 18px !important;
      border-top: 1px solid #e2e8f0;
    }

    .request-cancel-btn,
    .request-submit-btn {
      min-height: 40px;
      border: 0;
      border-radius: 10px;
      padding: 0 16px;
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
    }

    .request-cancel-btn {
      background: #e2e8f0;
      color: #334155;
    }

    .request-submit-btn {
      background: #16a34a;
      color: #ffffff;
    }

    .request-submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 640px) {
      .request-modal-header,
      .request-modal-content,
      .request-modal-actions {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }

      .request-modal-header h2 {
        font-size: 1.45rem;
      }

      .request-modal-actions {
        flex-direction: column-reverse;
      }

      .request-cancel-btn,
      .request-submit-btn {
        width: 100%;
      }
    }
  `]
})
export class RequestFormModalComponent {
  requestForm: FormGroup;
  readonly requestTypeOptions = [
    'Cambio de Aula',
    'Reporte de Falla Tecnica',
    'Solicitud de Material',
    'Ajuste de Horario'
  ];
  readonly classroomOptions: ClassroomOption[];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RequestFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { classroomOptions: ClassroomOption[] }
  ) {
    this.classroomOptions = data?.classroomOptions ?? [];

    this.requestForm = this.fb.group({
      type: [this.requestTypeOptions[0], Validators.required],
      classroom: [this.classroomOptions[0]?.value ?? '', Validators.required],
      reason: ['', Validators.required],
      information: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.requestForm.valid) {
      this.dialogRef.close(this.requestForm.getRawValue() as RequestFormValue);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
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

interface RequestItem {
  id: number;
  type: string;
  classroom: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  date: string;
  reason: string;
  information: string;
}

@Component({
  selector: 'app-solicitudes-m',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule, MatButtonModule, MatDialogModule],
  templateUrl: './solicitudes-m.html',
  styleUrls: ['./solicitudes-m.scss']
})
export class SolicitudesM {
  filterStatus = signal<'todas' | 'pendiente' | 'aprobada' | 'rechazada'>('todas');
  requests = signal<RequestItem[]>([]);
  classroomOptions = signal<ClassroomOption[]>([]);
  isLoading = signal(false);
  isLoadingClassrooms = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');

  filteredRequests = computed(() => {
    const status = this.filterStatus();
    return status === 'todas' ? this.requests() : this.requests().filter(r => r.status === status);
  });

  stats = computed(() => ({
    total: this.requests().length,
    pendiente: this.requests().filter(r => r.status === 'pendiente').length,
    aprobada: this.requests().filter(r => r.status === 'aprobada').length,
    rechazada: this.requests().filter(r => r.status === 'rechazada').length
  }));

  constructor(private dialog: MatDialog, private apiService: AdminService) {
    this.loadClassrooms();
    this.loadRequests();
  }

  openNewRequestModal(): void {
    if (this.classroomOptions().length === 0) {
      this.errorMessage.set('No hay aulas registradas disponibles para seleccionar.');
      return;
    }

    const dialogRef = this.dialog.open(RequestFormModalComponent, {
      width: '520px',
      maxWidth: 'calc(100vw - 1.5rem)',
      panelClass: 'teacher-request-dialog-panel',
      autoFocus: false,
      data: {
        classroomOptions: this.classroomOptions()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createRequest(result as RequestFormValue);
      }
    });
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'aprobada': return 'check_circle';
      case 'rechazada': return 'cancel';
      default: return 'pending';
    }
  }

  private loadRequests(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.apiService.getSolicitudes().subscribe({
      next: (requests) => {
        const mapped = (requests as unknown as ApiSolicitud[]).map((request) => this.mapApiRequest(request));
        this.requests.set(mapped);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.getApiErrorMessage(error));
      }
    });
  }

  private loadClassrooms(): void {
    this.isLoadingClassrooms.set(true);

    this.apiService.getAulas().subscribe({
      next: (classrooms) => {
        const options = (classrooms as unknown as ApiAula[]).map((classroom) => ({
          value: classroom.numero,
          label: `${classroom.numero} · ${classroom.edificio} · ${classroom.estado}`
        }));
        this.classroomOptions.set(options);
        this.isLoadingClassrooms.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoadingClassrooms.set(false);
        this.errorMessage.set(this.getApiErrorMessage(error));
      }
    });
  }

  private createRequest(formValue: RequestFormValue): void {
    this.isSubmitting.set(true);
    const payload = {
      tipo_solicitud: formValue.type,
      aula: formValue.classroom.trim(),
      motivo: formValue.reason.trim(),
      informacion_adicional: formValue.information.trim()
    };

    this.apiService.createSolicitud(payload as unknown as SolicitudCreate).subscribe({
      next: (request) => {
        const mapped = this.mapApiRequest(request as unknown as ApiSolicitud);
        this.requests.update((items) => [mapped, ...items]);
        this.isSubmitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(this.getApiErrorMessage(error));
      }
    });
  }

  private mapApiRequest(request: ApiSolicitud): RequestItem {
    return {
      id: request.id,
      type: request.tipo_solicitud,
      classroom: request.aula,
      status: this.mapStatus(request.estado),
      date: this.formatDate(request.fecha_solicitud),
      reason: request.motivo,
      information: request.informacion_adicional
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
    const date = new Date(value);

    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  private getApiErrorMessage(error: unknown): string {
    const fallback = 'No fue posible procesar la solicitud. Intenta de nuevo.';
    const httpError = error as HttpErrorResponse;
    const payload = httpError?.error as Record<string, unknown> | string | undefined;

    if (!payload) {
      return fallback;
    }

    if (typeof payload === 'string') {
      return payload;
    }

    if (typeof payload['message'] === 'string' && payload['message'].trim()) {
      return payload['message'];
    }

    const messages: string[] = [];
    for (const key of Object.keys(payload)) {
      const value = payload[key];
      if (Array.isArray(value)) {
        messages.push(`${key}: ${value.join(', ')}`);
      } else if (typeof value === 'string') {
        messages.push(`${key}: ${value}`);
      }
    }

    return messages.length > 0 ? messages.join(' | ') : fallback;
  }
}
