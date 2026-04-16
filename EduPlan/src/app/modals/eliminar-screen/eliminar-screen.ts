import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-eliminar-screen',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './eliminar-screen.html',
  styleUrl: './eliminar-screen.scss',
})
export class EliminarScreen {
  @Input() visible = false;
  @Input() title = 'Confirmar eliminación';
  @Input() message = 'Esta acción eliminará el registro seleccionado.';
  @Input() confirmLabel = 'Eliminar';
  @Input() cancelLabel = 'Cancelar';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onBackdropClick(): void {
    this.cancel.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }

}
