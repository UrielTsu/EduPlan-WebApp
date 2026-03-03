import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

interface Request {
  id: string;
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
  imports: [CommonModule, FormsModule, MatIconModule, MatCardModule, MatButtonModule, MatDialogModule],
  templateUrl: './solicitudes-m.html',
  styleUrls: ['./solicitudes-m.scss']
})
export class SolicitudesM {
  filterStatus = signal<'todas' | 'pendiente' | 'aprobada' | 'rechazada'>('todas');

  requests = signal<Request[]>([
    {
      id: '1',
      type: 'Cambio de Aula',
      classroom: 'Lab 205',
      status: 'pendiente',
      date: '2 Mar 2026',
      reason: 'Se requiere equipo de laboratorio',
      information: 'La clase de Programación requiere computadoras con mayor capacidad de procesamiento.'
    },
    {
      id: '2',
      type: 'Solicitud de Material',
      classroom: 'Lab 101',
      status: 'aprobada',
      date: '28 Feb 2026',
      reason: 'Proyector y pantalla',
      information: 'Necesito proyector y pantalla para presentación de trabajos finales.'
    },
    {
      id: '3',
      type: 'Reporte de Falla Técnica',
      classroom: 'Aula 405',
      status: 'pendiente',
      date: '1 Mar 2026',
      reason: 'Sistema de audio no funciona',
      information: 'El micrófono y bocinas del aula no están funcionando correctamente.'
    },
    {
      id: '4',
      type: 'Ajuste de Horario',
      classroom: 'Aula 301',
      status: 'rechazada',
      date: '25 Feb 2026',
      reason: 'Cambio de horario de clase',
      information: 'Solicito cambiar el horario de 8:00 AM a 10:00 AM.'
    }
  ]);

  // Filtro reactivo mediante computed
  filteredRequests = computed(() => {
    const status = this.filterStatus();
    return status === 'todas'
      ? this.requests()
      : this.requests().filter(r => r.status === status);
  });

  // Estadísticas reactivas
  stats = computed(() => ({
    total: this.requests().length,
    pendiente: this.requests().filter(r => r.status === 'pendiente').length,
    aprobada: this.requests().filter(r => r.status === 'aprobada').length,
    rechazada: this.requests().filter(r => r.status === 'rechazada').length
  }));

  constructor(private dialog: MatDialog) {}

  openNewRequestModal() {
    // Aquí abrirías el componente del modal que crearemos después
    console.log('Abriendo modal de nueva solicitud...');
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'aprobada': return 'check_circle';
      case 'rechazada': return 'cancel';
      default: return 'pending';
    }
  }
}
