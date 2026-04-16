import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-actualizar-screen',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './actualizar-screen.html',
  styleUrl: './actualizar-screen.scss',
})
export class ActualizarScreen {
  @Input() visible = false;
  @Input() title = 'Confirmar actualización';
  @Input() message = 'Se aplicarán los cambios realizados en este registro.';
  @Input() confirmLabel = 'Actualizar';
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
