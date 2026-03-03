import { Component, signal, computed, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

// --- 1. COMPONENTE DEL MODAL (Declarado en el mismo archivo) ---
@Component({
  selector: 'app-request-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <div class="modal-header-gradient" style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 1.5rem; margin: -24px -24px 0 -24px; color: white; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2 mat-dialog-title style="margin: 0; color: white;">Nueva Solicitud</h2>
        <p style="margin: 0; opacity: 0.8; font-size: 0.8rem;">Completa los campos para enviar tu solicitud</p>
      </div>
      <button mat-icon-button (click)="onCancel()" style="color: white;"><mat-icon>close</mat-icon></button>
    </div>

    <mat-dialog-content style="padding-top: 20px;">
      <form [formGroup]="requestForm">
        <mat-form-field appearance="outline" class="w-100 mb-2">
          <mat-label>Tipo de Solicitud</mat-label>
          <mat-select formControlName="type">
            <mat-option value="Cambio de Aula">Cambio de Aula</mat-option>
            <mat-option value="Reporte de Falla Técnica">Reporte de Falla Técnica</mat-option>
            <mat-option value="Solicitud de Material">Solicitud de Material</mat-option>
            <mat-option value="Ajuste de Horario">Ajuste de Horario</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-100 mb-2">
          <mat-label>Aula / Laboratorio</mat-label>
          <input matInput formControlName="classroom" placeholder="Ej: Aula 101">
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-100 mb-2">
          <mat-label>Motivo</mat-label>
          <input matInput formControlName="reason" placeholder="Ej: Falla en proyector">
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Información Adicional</mat-label>
          <textarea matInput formControlName="information" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" style="padding: 1rem;">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-flat-button color="success" (click)="onSubmit()" style="background-color: #16a34a; color: white;">Enviar Solicitud</button>
    </mat-dialog-actions>
  `,
  styles: [`.w-100 { width: 100%; }`]
})
export class RequestFormModalComponent {
  requestForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RequestFormModalComponent>
  ) {
    this.requestForm = this.fb.group({
      type: ['', Validators.required],
      classroom: ['', Validators.required],
      reason: ['', Validators.required],
      information: ['', Validators.required]
    });
  }
  onSubmit() { if (this.requestForm.valid) this.dialogRef.close(this.requestForm.value); }
  onCancel() { this.dialogRef.close(); }
}

// --- 2. COMPONENTE PRINCIPAL (SolicitudesM) ---
interface Request {
  id: string; type: string; classroom: string; status: 'pendiente' | 'aprobada' | 'rechazada'; date: string; reason: string; information: string;
}

@Component({
  selector: 'app-solicitudes-m',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatCardModule, MatButtonModule, MatDialogModule],
  templateUrl: './solicitudes-m.html',
  styleUrls: ['./solicitudes-m.scss']
})
export class SolicitudesM {
  filterStatus = signal<'todas' | 'pendiente' | 'aprobada' | 'rechazada'>('todas');
  requests = signal<Request[]>([
    { id: '1', type: 'Cambio de Aula', classroom: 'Lab 205', status: 'pendiente', date: '2 Mar 2026', reason: 'Se requiere equipo de laboratorio', information: 'La clase requiere computadoras de mayor capacidad.' },
    { id: '2', type: 'Solicitud de Material', classroom: 'Lab 101', status: 'aprobada', date: '28 Feb 2026', reason: 'Proyector y pantalla', information: 'Para presentación de trabajos finales.' }
  ]);

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

  constructor(private dialog: MatDialog) {}

  openNewRequestModal() {
    const dialogRef = this.dialog.open(RequestFormModalComponent, { width: '500px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newReq: Request = {
          id: (this.requests().length + 1).toString(),
          ...result,
          status: 'pendiente',
          date: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
        };
        this.requests.update(prev => [newReq, ...prev]);
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
}
