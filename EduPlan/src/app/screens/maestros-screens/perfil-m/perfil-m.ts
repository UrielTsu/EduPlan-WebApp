import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

interface TeacherProfile {
  name: string;
  email: string;
  phone: string;
  department: string;
  employeeId: string;
  specialty: string;
  contractType: string;
  hireDate: string;
  yearsOfService: string;
  officeHours: string;
  cubicle: string;
}

interface TeacherStat {
  label: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

interface TeacherCourse {
  name: string;
  code: string;
  students: number;
}

interface LegacyTeacherItem {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  contractType: string;
  hireDate: string;
  officeHours?: string;
  cubicle?: string;
  courses: number;
}

interface ApiDocente {
  usuario: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  numero_empleado: string;
  telefono?: string;
  departamento?: string;
  especializacion?: string;
  tipo_contrato?: string;
  fecha_contratacion?: string | null;
  horario_atencion?: string;
  cubiculo?: string;
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
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './perfil-m.html',
  styleUrls: ['./perfil-m.scss']
})
export class PerfilM implements OnInit {
  private readonly legacyTeachersStorageKey = 'edplan.gestion.docentes';
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);
  readonly officeDayOptions = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  profileData = signal<TeacherProfile>({
    name: '',
    email: '',
    phone: '',
    department: '',
    employeeId: '',
    specialty: '',
    contractType: '',
    hireDate: '',
    yearsOfService: '0 años',
    officeHours: '',
    cubicle: ''
  });

  isLoading = signal(true);
  isSaving = signal(false);
  errorMessage = signal('');
  showAvailabilityModal = signal(false);
  docenteId = signal<number | null>(null);
  courses = signal<TeacherCourse[]>([]);

  availabilityForm = this.fb.group({
    officeDays: this.fb.nonNullable.control<string[]>([], [Validators.required]),
    officeStartTime: ['', [Validators.required]],
    officeEndTime: ['', [Validators.required]],
    cubicle: ['', [Validators.required]]
  });

  stats = computed<TeacherStat[]>(() => [
    { label: 'Cursos Activos', value: String(this.courses().length), icon: 'book', color: 'blue' },
    { label: 'Total Estudiantes', value: String(this.courses().reduce((sum, course) => sum + course.students, 0)), icon: 'groups', color: 'green' },
    { label: 'Años de Servicio', value: this.profileData().yearsOfService, icon: 'workspace_premium', color: 'purple' },
    { label: 'Horas Semanales', value: String(this.calculateWeeklyHours()), icon: 'schedule', color: 'orange' }
  ]);

  ngOnInit(): void {
    forkJoin({
      user: this.authService.getCurrentUser(),
      docentes: this.adminService.getDocentes(),
      grupos: this.adminService.getGrupos()
    }).subscribe({
      next: ({ user, docentes, grupos }) => {
        const docente = (docentes as unknown as ApiDocente[]).find((item) => item.usuario?.id === user.id);
        const legacyTeacher = this.getLegacyTeacherBackup(user.id, user.email, docente?.numero_empleado ?? '');
        const teacherName = this.normalizeText(user.fullName || user.email);
        const teacherGroups = (grupos as unknown as ApiGrupo[]).filter((group) => this.normalizeText(group.docente) === teacherName);

        this.docenteId.set(docente?.usuario?.id ?? null);
        this.courses.set(teacherGroups.map((group) => ({
          name: group.materia,
          code: group.codigo,
          students: typeof group.inscritos === 'number' ? group.inscritos : 0
        })));

        const hireDate = docente?.fecha_contratacion?.trim() || legacyTeacher?.hireDate?.trim() || '';
        const officeHours = docente?.horario_atencion?.trim() || legacyTeacher?.officeHours?.trim() || '';
        const cubicle = docente?.cubiculo?.trim() || legacyTeacher?.cubicle?.trim() || '';

        this.profileData.set({
          name: user.fullName || docente?.usuario?.email || 'Docente',
          email: user.email,
          phone: docente?.telefono?.trim() || legacyTeacher?.phone?.trim() || 'No registrado',
          department: docente?.departamento?.trim() || legacyTeacher?.department?.trim() || 'No registrado',
          employeeId: docente?.numero_empleado?.trim() || 'No registrado',
          specialty: docente?.especializacion?.trim() || legacyTeacher?.specialization?.trim() || 'No registrado',
          contractType: docente?.tipo_contrato?.trim() || legacyTeacher?.contractType?.trim() || 'No registrado',
          hireDate: hireDate || 'No registrado',
          yearsOfService: this.formatYearsOfService(hireDate),
          officeHours: officeHours || 'No registrado',
          cubicle: cubicle || 'No registrado'
        });

        this.patchAvailabilityForm(officeHours, cubicle);

        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getApiErrorMessage(error));
        this.isLoading.set(false);
        this.authService.clearSession();
        this.router.navigate(['/login']);
      }
    });
  }

  openAvailabilityModal(): void {
    const current = this.profileData();
    this.patchAvailabilityForm(
      current.officeHours === 'No registrado' ? '' : current.officeHours,
      current.cubicle === 'No registrado' ? '' : current.cubicle,
    );
    this.showAvailabilityModal.set(true);
  }

  closeAvailabilityModal(): void {
    if (this.isSaving()) {
      return;
    }
    this.showAvailabilityModal.set(false);
  }

  saveAvailability(): void {
    const docenteId = this.docenteId();
    if (!docenteId || !this.isAvailabilityFormValid()) {
      this.availabilityForm.markAllAsTouched();
      this.errorMessage.set('Completa los días, el horario y el cubículo para actualizar la atención del docente.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const officeDays = this.availabilityForm.getRawValue().officeDays;
    const officeStartTime = this.availabilityForm.getRawValue().officeStartTime?.trim() ?? '';
    const officeEndTime = this.availabilityForm.getRawValue().officeEndTime?.trim() ?? '';
    const cubicle = this.availabilityForm.getRawValue().cubicle?.trim() ?? '';

    if (!officeStartTime || !officeEndTime || officeStartTime >= officeEndTime) {
      this.errorMessage.set('El horario de atención debe incluir una hora de inicio y una hora de fin válidas.');
      this.isSaving.set(false);
      return;
    }

    const officeHours = this.formatOfficeHours(officeDays, officeStartTime, officeEndTime);

    this.adminService.updateDocente(docenteId, {
      horario_atencion: officeHours,
      cubiculo: cubicle
    } as unknown as never).subscribe({
      next: () => {
        this.profileData.update((current) => ({
          ...current,
          officeHours: officeHours || 'No registrado',
          cubicle: cubicle || 'No registrado'
        }));
        this.syncLegacyTeacherBackup(docenteId, { officeHours, cubicle });
        this.isSaving.set(false);
        this.showAvailabilityModal.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getApiErrorMessage(error));
        this.isSaving.set(false);
      }
    });
  }

  toggleAvailabilityDay(day: string, checked: boolean): void {
    const currentDays = this.availabilityForm.controls.officeDays.getRawValue();

    if (checked) {
      if (!currentDays.includes(day)) {
        this.availabilityForm.controls.officeDays.setValue([...currentDays, day]);
      }
    } else {
      this.availabilityForm.controls.officeDays.setValue(currentDays.filter((item) => item !== day));
    }

    this.availabilityForm.controls.officeDays.markAsDirty();
    this.availabilityForm.controls.officeDays.markAsTouched();
    this.availabilityForm.controls.officeDays.updateValueAndValidity();
  }

  isAvailabilityDaySelected(day: string): boolean {
    return this.availabilityForm.controls.officeDays.getRawValue().includes(day);
  }

  isAvailabilityFormValid(): boolean {
    const rawValue = this.availabilityForm.getRawValue();
    const officeDays = rawValue.officeDays ?? [];
    const officeStartTime = rawValue.officeStartTime?.trim() ?? '';
    const officeEndTime = rawValue.officeEndTime?.trim() ?? '';
    const cubicle = rawValue.cubicle?.trim() ?? '';

    if (officeDays.length === 0 || !officeStartTime || !officeEndTime || !cubicle) {
      return false;
    }

    return officeStartTime < officeEndTime;
  }

  private calculateWeeklyHours(): number {
    return this.courses().length * 2;
  }

  private patchAvailabilityForm(officeHours: string, cubicle: string): void {
    const parsedOfficeHours = this.parseOfficeHours(officeHours);

    this.availabilityForm.patchValue({
      officeDays: parsedOfficeHours.days,
      officeStartTime: parsedOfficeHours.startTime,
      officeEndTime: parsedOfficeHours.endTime,
      cubicle
    });
    this.availabilityForm.updateValueAndValidity();
  }

  private parseOfficeHours(officeHours: string): { days: string[]; startTime: string; endTime: string } {
    if (!officeHours.trim()) {
      return { days: [], startTime: '', endTime: '' };
    }

    const normalized = officeHours.trim();
    const dotSeparatorParts = normalized.split('·').map((part) => part.trim());
    const timeMatch = normalized.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
    const matchedDays = this.officeDayOptions.filter((day) => normalized.includes(day));

    return {
      days: matchedDays,
      startTime: timeMatch?.[1] ?? (dotSeparatorParts[1]?.split('-')[0]?.trim() ?? ''),
      endTime: timeMatch?.[2] ?? (dotSeparatorParts[1]?.split('-')[1]?.trim() ?? ''),
    };
  }

  private formatOfficeHours(days: string[], startTime: string, endTime: string): string {
    const selectedDays = this.officeDayOptions.filter((day) => days.includes(day));
    return `${selectedDays.join(', ')} · ${startTime}-${endTime}`;
  }

  private formatYearsOfService(hireDate: string | null | undefined): string {
    if (!hireDate) {
      return 'No registrado';
    }

    const currentYear = new Date().getFullYear();
    const hireYear = new Date(hireDate).getFullYear();

    if (Number.isNaN(hireYear)) {
      return 'No registrado';
    }

    const years = Math.max(0, currentYear - hireYear);
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  }

  private normalizeText(value: string | null | undefined): string {
    return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
  }

  private getLegacyTeacherBackup(id: number, email: string, employeeId: string): LegacyTeacherItem | null {
    const items = this.readLegacyTeachers();
    return items.find((item) => {
      if (item.id === id) {
        return true;
      }

      if (employeeId.trim() && item.employeeId.trim().toUpperCase() === employeeId.trim().toUpperCase()) {
        return true;
      }

      return item.email.trim().toLowerCase() === email.trim().toLowerCase();
    }) ?? null;
  }

  private syncLegacyTeacherBackup(id: number, patch: Partial<Pick<LegacyTeacherItem, 'officeHours' | 'cubicle'>>): void {
    const items = this.readLegacyTeachers();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      return;
    }

    const updated = [...items];
    updated[index] = {
      ...updated[index],
      ...patch
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.legacyTeachersStorageKey, JSON.stringify(updated));
    }
  }

  private readLegacyTeachers(): LegacyTeacherItem[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }

    try {
      const rawValue = localStorage.getItem(this.legacyTeachersStorageKey);
      if (!rawValue) {
        return [];
      }

      const parsed = JSON.parse(rawValue);
      return Array.isArray(parsed) ? parsed as LegacyTeacherItem[] : [];
    } catch {
      return [];
    }
  }

  private getApiErrorMessage(error: HttpErrorResponse): string {
    const payload = error.error as Record<string, unknown> | string | undefined;

    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }

    if (payload && typeof payload === 'object' && typeof payload['message'] === 'string' && payload['message'].trim()) {
      return payload['message'];
    }

    return 'No fue posible cargar o actualizar el perfil del docente.';
  }
}
