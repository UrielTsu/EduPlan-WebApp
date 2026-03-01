import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-general-management',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './gestion-admin.html',
  styleUrls: ['./gestion-admin.scss']
})
export class GestionAdminComponent {
  // Estado centralizado
  periods = signal([
    { id: 1, name: 'Primavera 2025', dates: 'Feb - Jun 2025', status: 'Activo' },
    { id: 2, name: 'Otoño 2024', dates: 'Ago - Dic 2024', status: 'Finalizado' },
  ]);

  subjects = signal([
    { id: 1, code: 'CS301', name: 'Programación Orientada a Objetos', credits: 8 },
    { id: 2, code: 'CS302', name: 'Estructuras de Datos', credits: 8 },
  ]);

  // Métodos de acción
  deleteItem(id: number, type: string) {
    if (confirm('¿Estás seguro de eliminar este elemento?')) {
      // Lógica de eliminación...
    }
  }
}
