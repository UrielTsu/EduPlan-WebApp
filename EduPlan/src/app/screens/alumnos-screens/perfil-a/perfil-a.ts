import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';

interface ApiUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

interface ApiEstudiante {
  usuario: ApiUser;
  matricula: string;
  telefono: string;
  programa: string;
  semestre: string;
  fecha_inscripcion: string | null;
  direccion: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
}

interface StudentProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  studentId: string;
  institution: string;
  faculty: string;
  program: string;
  semester: string;
  enrollmentDate: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

@Component({
  selector: 'perfil-a',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule
  ],
  templateUrl: './perfil-a.html',
  styleUrls: ['./perfil-a.scss']
})
export class PerfilA implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);

  activeTab = signal<'info' | 'academic' | 'stats'>('info');
  isLoading = signal(true);
  errorMessage = signal('');

  profileData = signal<StudentProfileData>({
    name: '',
    email: '',
    phone: 'No registrado',
    address: 'No registrada',
    studentId: '',
    institution: 'Benemérita Universidad Autónoma de Puebla',
    faculty: 'No registrada',
    program: 'No registrado',
    semester: 'No registrado',
    enrollmentDate: 'No registrada',
    emergencyContactName: 'No registrado',
    emergencyContactPhone: 'No registrado',
  });

  ngOnInit(): void {
    forkJoin({
      user: this.authService.getCurrentUser(),
      estudiantes: this.adminService.getEstudiantes(),
    }).subscribe({
      next: ({ user, estudiantes }) => {
        const student = (estudiantes as unknown as ApiEstudiante[]).find((item) => item.usuario?.id === user.id);

        if (!student) {
          this.errorMessage.set('No se encontró la información del estudiante autenticado.');
          this.isLoading.set(false);
          return;
        }

        this.profileData.set({
          name: user.fullName,
          email: user.email,
          phone: student.telefono?.trim() || 'No registrado',
          address: student.direccion?.trim() || 'No registrada',
          studentId: student.matricula || 'No registrada',
          institution: 'Benemérita Universidad Autónoma de Puebla',
          faculty: this.resolveFaculty(student.programa),
          program: student.programa?.trim() || 'No registrado',
          semester: student.semestre?.trim() || 'No registrado',
          enrollmentDate: this.formatEnrollmentDate(student.fecha_inscripcion),
          emergencyContactName: student.contacto_emergencia_nombre?.trim() || 'No registrado',
          emergencyContactPhone: student.contacto_emergencia_telefono?.trim() || 'No registrado',
        });
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getApiErrorMessage(error));
        this.authService.clearSession();
        this.router.navigate(['/login']);
      }
    });
  }

  goBack() {
    window.history.back();
  }

  private resolveFaculty(program: string | null | undefined): string {
    const normalizedProgram = (program ?? '').trim().toLowerCase();

    if (!normalizedProgram) {
      return 'No registrada';
    }

    if (normalizedProgram.includes('comput') || normalizedProgram.includes('sistemas')) {
      return 'Facultad de Ciencias de la Computación';
    }

    if (normalizedProgram.includes('matem')) {
      return 'Facultad de Ciencias Físico Matemáticas';
    }

    return 'Facultad no registrada';
  }

  private formatEnrollmentDate(value: string | null): string {
    if (!value) {
      return 'No registrada';
    }

    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  }

  private getApiErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (typeof error.error?.message === 'string' && error.error.message.trim()) {
      return error.error.message;
    }

    return 'No se pudo cargar la información del perfil del alumno.';
  }
}
