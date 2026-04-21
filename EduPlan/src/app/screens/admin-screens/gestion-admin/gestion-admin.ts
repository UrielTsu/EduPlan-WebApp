import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AulaCreate, AulaUpdate, DocenteCreate, DocenteUpdate, EstudianteCreate, EstudianteUpdate, GrupoCreate, GrupoUpdate, MateriaCreate, MateriaUpdate, PeriodoCreate, PeriodoUpdate } from '../../../models/admin.models';
import { AdminService } from '../../../services/admin.service';
import { ActualizarScreen } from '../../../modals/actualizar-screen/actualizar-screen';
import { EliminarScreen } from '../../../modals/eliminar-screen/eliminar-screen';

type GestionTabKey = 'periodos' | 'materias' | 'grupos' | 'aulas' | 'docentes' | 'estudiantes';
type PeriodStatus = 'Activo' | 'Finalizado';
type ConfirmActionType = 'update' | 'delete';

interface PeriodItem {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: PeriodStatus;
}

interface PeriodFormModel {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface SubjectItem {
  id: number;
  code: string;
  name: string;
  credits: number;
  department: string;
}

interface SubjectFormModel {
  name: string;
  code: string;
  credits: number;
  department: string;
}

interface GroupItem {
  id: number;
  code: string;
  subject: string;
  teacher: string;
  classroomId: number | null;
  classroomName: string;
  students: number;
  semester: string;
  days: string[];
  day?: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  studentIds: number[];
  enrolledStudents: Array<{
    id: number;
    enrollment: string;
    name: string;
    email: string;
    program: string;
    semester: string;
    enrollmentDate?: string;
  }>;
}

interface GroupFormModel {
  name: string;
  subject: string;
  teacher: string;
  classroomId: number | null;
  semester: string;
  days: string[];
  startTime: string;
  endTime: string;
  maxCapacity: number;
  selectedStudentIds: number[];
}

type ClassroomStatus = 'Disponible' | 'Ocupado' | 'Fuera de servicio';

interface ClassroomItem {
  id: number;
  name: string;
  building: string;
  capacity: number;
  status: ClassroomStatus;
  resources: string[];
}

interface ClassroomFormModel {
  building: string;
  name: string;
  capacity: number;
  resources: string[];
  status: ClassroomStatus;
}

interface TeacherItem {
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

interface TeacherFormModel {
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  specialization: string;
  contractType: string;
  hireDate: string;
}

interface StudentItem {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  enrollment: string;
  email: string;
  phone: string;
  program: string;
  semester: string;
  enrollmentDate: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  status: 'Activo' | 'Inactivo';
  enrolledCourses: Array<{
    id: number;
    code: string;
    subject: string;
  }>;
}

interface StudentFormModel {
  firstName: string;
  lastName: string;
  enrollment: string;
  email: string;
  password: string;
  phone: string;
  program: string;
  semester: string;
  enrollmentDate: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  isActive: boolean;
}

interface ApiUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

interface ApiDocente {
  usuario: ApiUser;
  numero_empleado: string;
  telefono?: string;
  departamento?: string;
  especializacion?: string;
  tipo_contrato?: string;
  fecha_contratacion?: string | null;
  horario_atencion?: string;
  cubiculo?: string;
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
  grupos?: ApiStudentGroup[];
}

interface ApiStudentGroup {
  id: number;
  codigo: string;
  materia: string;
  docente: string;
  aula?: {
    id: number;
    edificio: string;
    numero: string;
    capacidad: number;
    estado: ClassroomStatus;
  } | null;
  semestre: string;
  dia_semana: string[];
  hora_inicio: string | null;
  hora_fin: string | null;
  cupo_max: number;
  inscritos: number;
  fecha_inscripcion: string | null;
}

interface ApiGroupStudent {
  id: number;
  matricula: string;
  nombre: string;
  email: string;
  programa: string;
  semestre: string;
  fecha_inscripcion: string | null;
}

interface ApiPeriodo {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: PeriodStatus;
}

interface ApiMateria {
  id: number;
  nombre: string;
  codigo: string;
  creditos: number;
  area_academica: string;
}

interface ApiGrupo {
  id: number;
  codigo: string;
  materia: string;
  docente: string;
  aula?: {
    id: number;
    edificio: string;
    numero: string;
    capacidad: number;
    estado: ClassroomStatus;
  } | null;
  semestre: string;
  dia_semana: string[];
  hora_inicio: string | null;
  hora_fin: string | null;
  cupo_max: number;
  inscritos: number;
  estudiantes?: ApiGroupStudent[];
}

interface ApiAula {
  id: number;
  edificio: string;
  numero: string;
  capacidad: number;
  recursos: string[];
  estado: ClassroomStatus;
}

@Component({
  selector: 'app-general-management',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink, FormsModule, ActualizarScreen, EliminarScreen],
  templateUrl: './gestion-admin.html',
  styleUrls: ['./gestion-admin.scss']
})
export class GestionAdminComponent {
  private readonly adminService = inject(AdminService);
  private pendingConfirmationAction: (() => void) | null = null;
  private readonly updatingClassroomStatusIds = signal<number[]>([]);

  private readonly storageKeys = {
    periods: 'edplan.gestion.periodos',
    subjects: 'edplan.gestion.materias',
    groups: 'edplan.gestion.grupos',
    classrooms: 'edplan.gestion.aulas',
    teachers: 'edplan.gestion.docentes',
    students: 'edplan.gestion.estudiantes'
  };

  readonly tabs: Array<{ key: GestionTabKey; label: string; icon: string }> = [
    { key: 'periodos', label: 'Periodos', icon: 'calendar_today' },
    { key: 'materias', label: 'Materias', icon: 'menu_book' },
    { key: 'grupos', label: 'Grupos', icon: 'group' },
    { key: 'aulas', label: 'Aulas', icon: 'apartment' },
    { key: 'docentes', label: 'Docentes', icon: 'school' },
    { key: 'estudiantes', label: 'Estudiantes', icon: 'account_circle' }
  ];

  activeTab = signal<GestionTabKey>('periodos');

  periods = signal<PeriodItem[]>([
    { id: 1, name: 'Primavera 2025', startDate: '2025-02-01', endDate: '2025-06-30', status: 'Activo' },
    { id: 2, name: 'Otoño 2024', startDate: '2024-08-01', endDate: '2024-12-15', status: 'Finalizado' }
  ]);

  showPeriodModal = signal(false);
  editingPeriodId = signal<number | null>(null);
  periodForm: PeriodFormModel = {
    name: '',
    startDate: '',
    endDate: '',
    isActive: true
  };

  subjects = signal<SubjectItem[]>([
    { id: 1, code: 'CS301', name: 'Programación Orientada a Objetos', credits: 8, department: 'Sistemas' },
    { id: 2, code: 'CS302', name: 'Estructuras de Datos Avanzadas', credits: 8, department: 'Sistemas' },
    { id: 3, code: 'MAT201', name: 'Matemáticas Discretas', credits: 6, department: 'Matemáticas' }
  ]);

  showSubjectModal = signal(false);
  editingSubjectId = signal<number | null>(null);
  creditOptions = [4, 6, 8, 10];
  areaOptions = ['Sistemas', 'Matemáticas', 'Ciencias Básicas', 'Administración'];
  subjectForm: SubjectFormModel = {
    name: '',
    code: '',
    credits: 6,
    department: ''
  };

  groups = signal<GroupItem[]>([
    {
      id: 1,
      code: 'CS301-A',
      subject: 'Programación Orientada a Objetos',
      teacher: 'Prof. Carlos Ruiz',
      classroomId: null,
      classroomName: 'Sin aula asignada',
      students: 35,
      semester: '5° semestre',
      days: ['Lunes', 'Miércoles'],
      startTime: '07:00',
      endTime: '09:00',
      maxCapacity: 35,
      studentIds: [],
      enrolledStudents: []
    },
    {
      id: 2,
      code: 'CS302-B',
      subject: 'Estructuras de Datos Avanzadas',
      teacher: 'Dra. María González',
      classroomId: null,
      classroomName: 'Sin aula asignada',
      students: 28,
      semester: '5° semestre',
      days: ['Martes', 'Jueves'],
      startTime: '10:00',
      endTime: '12:00',
      maxCapacity: 28,
      studentIds: [],
      enrolledStudents: []
    }
  ]);

  showGroupModal = signal(false);
  editingGroupId = signal<number | null>(null);
  groupDayOptions = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  groupForm: GroupFormModel = {
    name: '',
    subject: '',
    teacher: '',
    classroomId: null,
    semester: '',
    days: [],
    startTime: '',
    endTime: '',
    maxCapacity: 40,
    selectedStudentIds: []
  };

  classrooms = signal<ClassroomItem[]>([
    {
      id: 1,
      name: 'Aula 101',
      building: 'Edificio A',
      capacity: 40,
      status: 'Disponible',
      resources: ['Proyector', 'Pantalla']
    },
    {
      id: 2,
      name: 'Lab 205',
      building: 'Edificio B',
      capacity: 25,
      status: 'Ocupado',
      resources: ['Equipo Especializado', 'Aire Acondicionado']
    }
  ]);

  showClassroomModal = signal(false);
  editingClassroomId = signal<number | null>(null);
  buildingOptions = ['Edificio A', 'Edificio B', 'Edificio C'];
  classroomStatusOptions: ClassroomStatus[] = ['Disponible', 'Ocupado', 'Fuera de servicio'];
  resourceOptions: Array<{ name: string; icon: string }> = [
    { name: 'Proyector', icon: 'tv' },
    { name: 'Aire Acondicionado', icon: 'ac_unit' },
    { name: 'Pódium', icon: 'co_present' },
    { name: 'Pantalla', icon: 'desktop_windows' },
    { name: 'Equipo Especializado', icon: 'science' }
  ];
  classroomForm: ClassroomFormModel = {
    building: '',
    name: '',
    capacity: 30,
    resources: [],
    status: 'Disponible'
  };

  teachers = signal<TeacherItem[]>([
    {
      id: 1,
      firstName: 'Prof. Carlos',
      lastName: 'Ruiz',
      name: 'Prof. Carlos Ruiz',
      employeeId: 'EMP-2024-001',
      email: 'carlos.ruiz@universidad.edu',
      phone: '(222) 123-4567',
      department: 'Sistemas',
      specialization: 'Programación Orientada a Objetos',
      contractType: 'Tiempo Completo',
      hireDate: '2024-01-15',
      courses: 3
    },
    {
      id: 2,
      firstName: 'Dra. María',
      lastName: 'González',
      name: 'Dra. María González',
      employeeId: 'EMP-2024-002',
      email: 'maria.gonzalez@universidad.edu',
      phone: '(222) 555-4421',
      department: 'Sistemas',
      specialization: 'Estructuras de Datos',
      contractType: 'Tiempo Completo',
      hireDate: '2023-08-01',
      courses: 2
    }
  ]);

  showTeacherModal = signal(false);
  editingTeacherId = signal<number | null>(null);
  teacherDepartmentOptions = ['Sistemas', 'Matemáticas', 'Ciencias Básicas', 'Administración'];
  contractTypeOptions = ['Tiempo Completo', 'Medio Tiempo', 'Por Horas'];
  teacherForm: TeacherFormModel = {
    firstName: '',
    lastName: '',
    employeeId: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    specialization: '',
    contractType: 'Tiempo Completo',
    hireDate: ''
  };

  students = signal<StudentItem[]>([
    {
      id: 1,
      firstName: 'Juan',
      lastName: 'Pérez',
      name: 'Juan Pérez',
      enrollment: 'A01234567',
      email: 'a01234567@alumno.buap.mx',
      phone: '(222) 123-4567',
      program: 'Ing. en Computación',
      semester: '5°',
      enrollmentDate: '2024-01-15',
      address: 'Calle 10 #123, Puebla',
      emergencyContactName: 'Ana Pérez',
      emergencyContactPhone: '(222) 999-1111',
      status: 'Activo',
      enrolledCourses: []
    },
    {
      id: 2,
      firstName: 'María',
      lastName: 'López',
      name: 'María López',
      enrollment: 'A01234568',
      email: 'a01234568@alumno.buap.mx',
      phone: '(222) 987-6543',
      program: 'Ing. en Computación',
      semester: '5°',
      enrollmentDate: '2024-01-15',
      address: 'Av. Universidad 450, Puebla',
      emergencyContactName: 'José López',
      emergencyContactPhone: '(222) 888-7777',
      status: 'Activo',
      enrolledCourses: []
    }
  ]);

  showStudentModal = signal(false);
  editingStudentId = signal<number | null>(null);
  studentProgramOptions = [
    'Ing. en Computación',
    'Ing. en Sistemas',
    'Ing. Industrial',
    'Lic. en Matemáticas'
  ];
  studentSemesterOptions = ['1° Semestre', '2° Semestre', '3° Semestre', '4° Semestre', '5° Semestre', '6° Semestre'];
  studentForm: StudentFormModel = {
    firstName: '',
    lastName: '',
    enrollment: '',
    email: '',
    password: '',
    phone: '',
    program: '',
    semester: '1° Semestre',
    enrollmentDate: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    isActive: true
  };

  showUpdateConfirmationModal = signal(false);
  showDeleteConfirmationModal = signal(false);
  confirmationTitle = signal('');
  confirmationMessage = signal('');

  constructor() {
    this.loadAllFromStorage();
    this.registerPersistenceEffects();
    this.loadPeriodsFromApi();
    this.loadSubjectsFromApi();
    this.loadGroupsFromApi();
    this.loadClassroomsFromApi();
    this.loadUsersFromApi();
  }

  setActiveTab(tab: GestionTabKey): void {
    this.activeTab.set(tab);
  }

  onCreate(tab: GestionTabKey): void {
    if (tab === 'periodos') {
      this.openCreatePeriodModal();
      return;
    }

    if (tab === 'materias') {
      this.openCreateSubjectModal();
      return;
    }

    if (tab === 'grupos') {
      this.openCreateGroupModal();
      return;
    }

    if (tab === 'aulas') {
      this.openCreateClassroomModal();
      return;
    }

    if (tab === 'docentes') {
      this.openCreateTeacherModal();
      return;
    }

    if (tab === 'estudiantes') {
      this.openCreateStudentModal();
      return;
    }

    console.log('Crear en', tab);
  }

  editItem(id: number, tab: GestionTabKey): void {
    if (tab === 'periodos') {
      this.openEditPeriodModal(id);
      return;
    }

    if (tab === 'materias') {
      this.openEditSubjectModal(id);
      return;
    }

    if (tab === 'grupos') {
      this.openEditGroupModal(id);
      return;
    }

    if (tab === 'aulas') {
      this.openEditClassroomModal(id);
      return;
    }

    if (tab === 'docentes') {
      this.openEditTeacherModal(id);
      return;
    }

    if (tab === 'estudiantes') {
      this.openEditStudentModal(id);
      return;
    }

    console.log('Editar', tab, id);
  }

  deleteItem(id: number, tab: GestionTabKey): void {
    const label = this.getRecordLabel(tab, id);
    this.openDeleteConfirmation(tab, label, () => this.executeDeleteItem(id, tab));
  }

  confirmPendingAction(): void {
    const action = this.pendingConfirmationAction;
    this.closeConfirmationModals();
    action?.();
  }

  closeConfirmationModals(): void {
    this.pendingConfirmationAction = null;
    this.showUpdateConfirmationModal.set(false);
    this.showDeleteConfirmationModal.set(false);
    this.confirmationTitle.set('');
    this.confirmationMessage.set('');
  }

  private openUpdateConfirmation(entityLabel: string, action: () => void): void {
    this.pendingConfirmationAction = action;
    this.confirmationTitle.set('Confirmar actualización');
    this.confirmationMessage.set(`Se actualizará el registro de ${entityLabel}. Verifica los cambios antes de continuar.`);
    this.showDeleteConfirmationModal.set(false);
    this.showUpdateConfirmationModal.set(true);
  }

  private openDeleteConfirmation(tab: GestionTabKey, recordLabel: string, action: () => void): void {
    const sectionLabel = this.getTabSingularLabel(tab);
    this.pendingConfirmationAction = action;
    this.confirmationTitle.set(`Eliminar ${sectionLabel}`);
    this.confirmationMessage.set(`Se eliminará ${recordLabel}. Esta acción no se puede deshacer.`);
    this.showUpdateConfirmationModal.set(false);
    this.showDeleteConfirmationModal.set(true);
  }

  private executeDeleteItem(id: number, tab: GestionTabKey): void {
    switch (tab) {
      case 'periodos':
        this.adminService.deletePeriodo(id).subscribe({
          next: () => this.periods.update((items) => items.filter((item) => item.id !== id)),
          error: (error) => alert(`No se pudo eliminar el periodo. ${this.getApiErrorMessage(error)}`)
        });
        break;
      case 'materias':
        this.adminService.deleteMateria(id).subscribe({
          next: () => this.subjects.update((items) => items.filter((item) => item.id !== id)),
          error: (error) => alert(`No se pudo eliminar la materia. ${this.getApiErrorMessage(error)}`)
        });
        break;
      case 'grupos':
        this.adminService.deleteGrupo(id).subscribe({
          next: () => {
            this.groups.update((items) => items.filter((item) => item.id !== id));
            this.syncTeacherCourseCounts();
          },
          error: (error) => alert(`No se pudo eliminar el grupo. ${this.getApiErrorMessage(error)}`)
        });
        break;
      case 'aulas':
        this.adminService.deleteAula(id).subscribe({
          next: () => this.classrooms.update((items) => items.filter((item) => item.id !== id)),
          error: (error) => alert(`No se pudo eliminar el aula. ${this.getApiErrorMessage(error)}`)
        });
        break;
      case 'docentes':
        this.adminService.deleteDocente(id).subscribe({
          next: () => this.teachers.update((items) => items.filter((item) => item.id !== id)),
          error: (error) => alert(`No se pudo eliminar el docente. ${this.getApiErrorMessage(error)}`)
        });
        break;
      case 'estudiantes':
        this.adminService.deleteEstudiante(id).subscribe({
          next: () => this.students.update((items) => items.filter((item) => item.id !== id)),
          error: (error) => alert(`No se pudo eliminar el estudiante. ${this.getApiErrorMessage(error)}`)
        });
        break;
    }
  }

  isCurrentTabEmpty(): boolean {
    switch (this.activeTab()) {
      case 'periodos':
        return this.periods().length === 0;
      case 'materias':
        return this.subjects().length === 0;
      case 'grupos':
        return this.groups().length === 0;
      case 'aulas':
        return this.classrooms().length === 0;
      case 'docentes':
        return this.teachers().length === 0;
      case 'estudiantes':
        return this.students().length === 0;
      default:
        return true;
    }
  }

  openCreatePeriodModal(): void {
    this.editingPeriodId.set(null);
    this.periodForm = {
      name: '',
      startDate: '',
      endDate: '',
      isActive: true
    };
    this.showPeriodModal.set(true);
  }

  openEditPeriodModal(id: number): void {
    const selectedPeriod = this.periods().find((item) => item.id === id);

    if (!selectedPeriod) {
      return;
    }

    this.editingPeriodId.set(id);
    this.periodForm = {
      name: selectedPeriod.name,
      startDate: selectedPeriod.startDate,
      endDate: selectedPeriod.endDate,
      isActive: selectedPeriod.status === 'Activo'
    };
    this.showPeriodModal.set(true);
  }

  closePeriodModal(): void {
    this.showPeriodModal.set(false);
  }

  onPeriodNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]/g, '');
    const capitalized = cleaned.replace(/(?:^|\s)\S/g, c => c.toUpperCase());
    this.periodForm.name = capitalized;
    input.value = capitalized;
  }

  isPeriodFormValid(): boolean {
    const f = this.periodForm;
    if (!f.name.trim() || !f.startDate || !f.endDate) {
      return false;
    }
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\s\d{4}$/;
    if (!nameRegex.test(f.name.trim())) {
      return false;
    }
    return true;
  }

  savePeriod(): void {
    if (this.editingPeriodId() !== null) {
      this.openUpdateConfirmation(this.getRecordLabel('periodos', this.editingPeriodId()), () => this.executeSavePeriod());
      return;
    }

    this.executeSavePeriod();
  }

  private executeSavePeriod(): void {
    const name = this.periodForm.name.trim();
    const startDate = this.periodForm.startDate;
    const endDate = this.periodForm.endDate;

    if (!this.isPeriodFormValid()) {
      return;
    }

    const status: PeriodStatus = this.periodForm.isActive ? 'Activo' : 'Finalizado';
    const currentId = this.editingPeriodId();
    const payload = {
      nombre: name,
      fecha_inicio: startDate,
      fecha_fin: endDate,
      estado: status
    };

    if (currentId !== null) {
      this.adminService.updatePeriodo(currentId, payload as unknown as PeriodoUpdate).subscribe({
        next: (periodo) => {
          const mapped = this.mapApiPeriodoToPeriodItem(periodo as unknown as ApiPeriodo);
          this.periods.update((items) => items.map((item) => (item.id === currentId ? mapped : item)));
          this.closePeriodModal();
        },
        error: (error) => alert(`No se pudo actualizar el periodo. ${this.getApiErrorMessage(error)}`)
      });
      return;
    }

    this.adminService.createPeriodo(payload as unknown as PeriodoCreate).subscribe({
      next: (periodo) => {
        const mapped = this.mapApiPeriodoToPeriodItem(periodo as unknown as ApiPeriodo);
        this.periods.update((items) => [...items, mapped]);
        this.closePeriodModal();
      },
      error: (error) => alert(`No se pudo guardar el periodo. ${this.getApiErrorMessage(error)}`)
    });
  }

  openCreateSubjectModal(): void {
    this.editingSubjectId.set(null);
    this.subjectForm = {
      name: '',
      code: '',
      credits: 6,
      department: ''
    };
    this.showSubjectModal.set(true);
  }

  openEditSubjectModal(id: number): void {
    const selectedSubject = this.subjects().find((item) => item.id === id);

    if (!selectedSubject) {
      return;
    }

    this.editingSubjectId.set(id);
    this.subjectForm = {
      name: selectedSubject.name,
      code: selectedSubject.code,
      credits: selectedSubject.credits,
      department: selectedSubject.department
    };
    this.showSubjectModal.set(true);
  }

  closeSubjectModal(): void {
    this.showSubjectModal.set(false);
  }

  onSubjectNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    const capitalized = cleaned.replace(/(?:^|\s)\S/g, c => c.toUpperCase());
    this.subjectForm.name = capitalized;
    input.value = capitalized;
  }

  onSubjectCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 6);
    this.subjectForm.code = cleaned;
    input.value = cleaned;
  }

  isSubjectFormValid(): boolean {
    const f = this.subjectForm;
    if (!f.name.trim() || !f.code.trim() || !f.credits || !f.department) {
      return false;
    }
    return true;
  }

  saveSubject(): void {
    if (this.editingSubjectId() !== null) {
      this.openUpdateConfirmation(this.getRecordLabel('materias', this.editingSubjectId()), () => this.executeSaveSubject());
      return;
    }

    this.executeSaveSubject();
  }

  private executeSaveSubject(): void {
    const name = this.subjectForm.name.trim();
    const code = this.subjectForm.code.trim().toUpperCase();
    const credits = Number(this.subjectForm.credits);
    const department = this.subjectForm.department;

    if (!this.isSubjectFormValid()) {
      return;
    }

    const currentId = this.editingSubjectId();
    const payload = {
      nombre: name,
      codigo: code,
      creditos: credits,
      area_academica: department
    };

    if (currentId !== null) {
      this.adminService.updateMateria(currentId, payload as unknown as MateriaUpdate).subscribe({
        next: (materia) => {
          const mapped = this.mapApiMateriaToSubjectItem(materia as unknown as ApiMateria);
          this.subjects.update((items) => items.map((item) => (item.id === currentId ? mapped : item)));
          this.closeSubjectModal();
        },
        error: (error) => alert(`No se pudo actualizar la materia. ${this.getApiErrorMessage(error)}`)
      });
      return;
    }

    this.adminService.createMateria(payload as unknown as MateriaCreate).subscribe({
      next: (materia) => {
        const mapped = this.mapApiMateriaToSubjectItem(materia as unknown as ApiMateria);
        this.subjects.update((items) => [...items, mapped]);
        this.closeSubjectModal();
      },
      error: (error) => alert(`No se pudo guardar la materia. ${this.getApiErrorMessage(error)}`)
    });
  }

  openCreateGroupModal(): void {
    this.editingGroupId.set(null);
    this.groupForm = {
      name: '',
      subject: '',
      teacher: '',
      classroomId: null,
      semester: '',
      days: [],
      startTime: '',
      endTime: '',
      maxCapacity: 40,
      selectedStudentIds: []
    };
    this.showGroupModal.set(true);
  }

  openEditGroupModal(id: number): void {
    const selectedGroup = this.groups().find((item) => item.id === id);

    if (!selectedGroup) {
      return;
    }

    this.editingGroupId.set(id);
    this.groupForm = {
      name: selectedGroup.code,
      subject: selectedGroup.subject,
      teacher: selectedGroup.teacher,
      classroomId: selectedGroup.classroomId,
      semester: selectedGroup.semester,
      days: this.getGroupDays(selectedGroup),
      startTime: selectedGroup.startTime,
      endTime: selectedGroup.endTime,
      maxCapacity: selectedGroup.maxCapacity,
      selectedStudentIds: [...selectedGroup.studentIds]
    };
    this.showGroupModal.set(true);
  }

  closeGroupModal(): void {
    this.showGroupModal.set(false);
  }

  isGroupNameTaken(): boolean {
    const name = this.groupForm.name.trim().toLowerCase();

    if (!name) {
      return false;
    }

    return this.groups().some((group) => {
      if (this.editingGroupId() !== null && group.id === this.editingGroupId()) {
        return false;
      }

      return group.code.trim().toLowerCase() === name;
    });
  }

  onGroupNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    let formatted = cleaned;
    if (cleaned.length > 5) {
      formatted = `${cleaned.substring(0, 5)}-${cleaned.substring(5, 6).replace(/[^a-zA-Z]/g, '')}`;
    }
    this.groupForm.name = formatted;
    input.value = formatted;
  }

  toggleGroupDay(day: string, checked: boolean): void {
    if (checked) {
      if (!this.groupForm.days.includes(day)) {
        this.groupForm.days = [...this.groupForm.days, day];
      }

      return;
    }

    this.groupForm.days = this.groupForm.days.filter((item) => item !== day);
  }

  isGroupDaySelected(day: string): boolean {
    return this.groupForm.days.includes(day);
  }

  toggleGroupStudent(studentId: number, checked: boolean): void {
    if (checked) {
      if (!this.groupForm.selectedStudentIds.includes(studentId)) {
        this.groupForm.selectedStudentIds = [...this.groupForm.selectedStudentIds, studentId];
      }

      return;
    }

    this.groupForm.selectedStudentIds = this.groupForm.selectedStudentIds.filter((id) => id !== studentId);
  }

  isGroupStudentSelected(studentId: number): boolean {
    return this.groupForm.selectedStudentIds.includes(studentId);
  }

  isStudentSelectionDisabled(studentId: number): boolean {
    return !this.isGroupStudentSelected(studentId) && this.groupForm.selectedStudentIds.length >= Number(this.groupForm.maxCapacity);
  }

  isGroupFormValid(): boolean {
    const f = this.groupForm;
    if (!f.name.trim() || !f.subject || !f.teacher || !f.semester.trim() || f.days.length === 0 || !f.startTime || !f.endTime || !f.maxCapacity || this.isGroupNameTaken()) {
      return false;
    }
    const nameRegex = /^[A-Z0-9]{5}-[A-Z]$/;
    if (!nameRegex.test(f.name.trim())) {
      return false;
    }
    if (f.startTime >= f.endTime) {
      return false;
    }
    if (f.selectedStudentIds.length > Number(f.maxCapacity)) {
      return false;
    }
    return true;
  }

  saveGroup(): void {
    if (this.editingGroupId() !== null) {
      this.openUpdateConfirmation(this.getRecordLabel('grupos', this.editingGroupId()), () => this.executeSaveGroup());
      return;
    }

    this.executeSaveGroup();
  }

  private executeSaveGroup(): void {
    const name = this.groupForm.name.trim();
    const subject = this.groupForm.subject;
    const teacher = this.groupForm.teacher;
    const classroomId = this.groupForm.classroomId;
    const semester = this.groupForm.semester.trim();
    const days = [...this.groupForm.days];
    const startTime = this.groupForm.startTime;
    const endTime = this.groupForm.endTime;
    const maxCapacity = Number(this.groupForm.maxCapacity);
    const selectedStudentIds = [...this.groupForm.selectedStudentIds];

    if (!this.isGroupFormValid()) {
      return;
    }

    const currentId = this.editingGroupId();
    const payload = {
      codigo: name,
      materia: subject,
      docente: teacher,
      aula_id: classroomId,
      semestre: semester,
      dia_semana: days,
      hora_inicio: startTime,
      hora_fin: endTime,
      cupo_max: maxCapacity,
      estudiante_ids: selectedStudentIds
    };

    if (currentId !== null) {
      this.adminService.updateGrupo(currentId, payload as unknown as GrupoUpdate).subscribe({
        next: (grupo) => {
          const mapped = this.mapApiGrupoToGroupItem(grupo as unknown as ApiGrupo);
          this.groups.update((items) => items.map((item) => (item.id === currentId ? mapped : item)));
          this.syncTeacherCourseCounts();
          this.closeGroupModal();
        },
        error: (error) => alert(`No se pudo actualizar el grupo. ${this.getApiErrorMessage(error)}`)
      });
      return;
    }

    this.adminService.createGrupo(payload as unknown as GrupoCreate).subscribe({
      next: (grupo) => {
        const mapped = this.mapApiGrupoToGroupItem(grupo as unknown as ApiGrupo);
        this.groups.update((items) => [...items, mapped]);
        this.syncTeacherCourseCounts();
        this.closeGroupModal();
      },
      error: (error) => alert(`No se pudo guardar el grupo. ${this.getApiErrorMessage(error)}`)
    });
  }

  openCreateClassroomModal(): void {
    this.editingClassroomId.set(null);
    this.classroomForm = {
      building: '',
      name: '',
      capacity: 30,
      resources: [],
      status: 'Disponible'
    };
    this.showClassroomModal.set(true);
  }

  openEditClassroomModal(id: number): void {
    const selectedClassroom = this.classrooms().find((item) => item.id === id);

    if (!selectedClassroom) {
      return;
    }

    this.editingClassroomId.set(id);
    this.classroomForm = {
      building: selectedClassroom.building,
      name: selectedClassroom.name,
      capacity: selectedClassroom.capacity,
      resources: [...selectedClassroom.resources],
      status: selectedClassroom.status
    };
    this.showClassroomModal.set(true);
  }

  closeClassroomModal(): void {
    this.showClassroomModal.set(false);
  }

  isUpdatingClassroomStatus(id: number): boolean {
    return this.updatingClassroomStatusIds().includes(id);
  }

  updateClassroomStatus(id: number, status: ClassroomStatus): void {
    const currentRoom = this.classrooms().find((item) => item.id === id);

    if (!currentRoom) {
      return;
    }

    const normalizedStatus = this.normalizeClassroomStatus(status);

    if (currentRoom.status === normalizedStatus || this.isUpdatingClassroomStatus(id)) {
      return;
    }

    this.updatingClassroomStatusIds.update((ids) => [...ids, id]);

    this.adminService.updateAula(id, { estado: normalizedStatus } as unknown as AulaUpdate).subscribe({
      next: (aula) => {
        const mapped = this.mapApiAulaToClassroomItem(aula as unknown as ApiAula);
        this.classrooms.update((items) => items.map((item) => (item.id === id ? mapped : item)));
        this.updatingClassroomStatusIds.update((ids) => ids.filter((itemId) => itemId !== id));
      },
      error: (error) => {
        this.updatingClassroomStatusIds.update((ids) => ids.filter((itemId) => itemId !== id));
        alert(`No se pudo actualizar el estado del aula. ${this.getApiErrorMessage(error)}`);
      }
    });
  }

  decrementCapacity(): void {
    this.classroomForm.capacity = Math.max(1, Number(this.classroomForm.capacity) - 1);
  }

  incrementCapacity(): void {
    this.classroomForm.capacity = Number(this.classroomForm.capacity) + 1;
  }

  toggleResource(resource: string): void {
    const selected = this.classroomForm.resources;
    const index = selected.indexOf(resource);

    if (index >= 0) {
      this.classroomForm.resources = selected.filter((item) => item !== resource);
    } else {
      this.classroomForm.resources = [...selected, resource];
    }
  }

  hasResource(resource: string): boolean {
    return this.classroomForm.resources.includes(resource);
  }

  isClassroomFormValid(): boolean {
    const f = this.classroomForm;
    if (!f.building || !f.name.trim() || !f.capacity) {
      return false;
    }
    const nameRegex = /^(Aula|Lab)\s\d{3}$/;
    if (!nameRegex.test(f.name.trim())) {
      return false;
    }
    return true;
  }

  saveClassroom(): void {
    if (this.editingClassroomId() !== null) {
      this.openUpdateConfirmation(this.getRecordLabel('aulas', this.editingClassroomId()), () => this.executeSaveClassroom());
      return;
    }

    this.executeSaveClassroom();
  }

  private executeSaveClassroom(): void {
    const building = this.classroomForm.building;
    const name = this.classroomForm.name.trim();
    const capacity = Number(this.classroomForm.capacity);
    const resources = [...this.classroomForm.resources];
    const status = this.classroomForm.status;

    if (!this.isClassroomFormValid()) {
      return;
    }

    const currentId = this.editingClassroomId();
    const payload = {
      edificio: building,
      numero: name,
      capacidad: capacity,
      recursos: resources,
      estado: status
    };

    if (currentId !== null) {
      this.adminService.updateAula(currentId, payload as unknown as AulaUpdate).subscribe({
        next: (aula) => {
          const mapped = this.mapApiAulaToClassroomItem(aula as unknown as ApiAula);
          this.classrooms.update((items) => items.map((item) => (item.id === currentId ? mapped : item)));
          this.closeClassroomModal();
        },
        error: (error) => alert(`No se pudo actualizar el aula. ${this.getApiErrorMessage(error)}`)
      });
      return;
    }

    this.adminService.createAula(payload as unknown as AulaCreate).subscribe({
      next: (aula) => {
        const mapped = this.mapApiAulaToClassroomItem(aula as unknown as ApiAula);
        this.classrooms.update((items) => [...items, mapped]);
        this.closeClassroomModal();
      },
      error: (error) => alert(`No se pudo guardar el aula. ${this.getApiErrorMessage(error)}`)
    });
  }

  openCreateTeacherModal(): void {
    this.editingTeacherId.set(null);
    this.teacherForm = {
      firstName: '',
      lastName: '',
      employeeId: '',
      email: '',
      password: '',
      phone: '',
      department: '',
      specialization: '',
      contractType: 'Tiempo Completo',
      hireDate: ''
    };
    this.showTeacherModal.set(true);
  }

  openEditTeacherModal(id: number): void {
    const selectedTeacher = this.teachers().find((item) => item.id === id);

    if (!selectedTeacher) {
      return;
    }

    this.editingTeacherId.set(id);
    this.teacherForm = {
      firstName: selectedTeacher.firstName,
      lastName: selectedTeacher.lastName,
      employeeId: selectedTeacher.employeeId,
      email: selectedTeacher.email,
      password: '',
      phone: selectedTeacher.phone,
      department: selectedTeacher.department,
      specialization: selectedTeacher.specialization,
      contractType: selectedTeacher.contractType,
      hireDate: selectedTeacher.hireDate
    };
    this.showTeacherModal.set(true);
  }

  closeTeacherModal(): void {
    this.showTeacherModal.set(false);
  }

  onTeacherNameInput(event: Event, field: 'firstName' | 'lastName'): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\.\s]/g, '');
    this.teacherForm[field] = cleaned;
    input.value = cleaned;
  }

  onTeacherEmployeeIdInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    let formatted = cleaned;
    if (cleaned.length > 0 && cleaned.length <= 3) {
      formatted = cleaned;
    } else if (cleaned.length > 3 && cleaned.length <= 7) {
      formatted = `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
    } else if (cleaned.length > 7) {
      formatted = `${cleaned.substring(0, 3)}-${cleaned.substring(3, 7)}-${cleaned.substring(7, 10)}`;
    }
    this.teacherForm.employeeId = formatted;
    input.value = formatted;
  }

  onTeacherPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = ('' + input.value).replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 0 && cleaned.length <= 3) {
      formatted = cleaned;
    } else if (cleaned.length > 3 && cleaned.length <= 6) {
      formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
    } else if (cleaned.length > 6) {
      formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)} ${cleaned.substring(6, 10)}`;
    }

    this.teacherForm.phone = formatted;
    input.value = formatted;
  }

  isTeacherFormValid(): boolean {
    const f = this.teacherForm;
    if (!f.firstName.trim() || !f.lastName.trim() || !f.employeeId.trim() || !f.email.trim() || !f.department || !f.contractType || !f.hireDate) {
      return false;
    }
    const password = f.password.trim();
    if (this.editingTeacherId() === null && !password) {
      return false;
    }
    if (password && password.length < 6) {
      return false;
    }
    if (f.employeeId.trim().length !== 12) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(f.email.trim())) {
      return false;
    }
    return true;
  }

  saveTeacher(): void {
    if (this.editingTeacherId() !== null) {
      this.openUpdateConfirmation(this.getRecordLabel('docentes', this.editingTeacherId()), () => this.executeSaveTeacher());
      return;
    }

    this.executeSaveTeacher();
  }

  private executeSaveTeacher(): void {
    const firstName = this.teacherForm.firstName.trim();
    const lastName = this.teacherForm.lastName.trim();
    const employeeId = this.teacherForm.employeeId.trim().toUpperCase();
    const email = this.teacherForm.email.trim().toLowerCase();
    const password = this.teacherForm.password.trim();
    const phone = this.teacherForm.phone.trim();
    const department = this.teacherForm.department;
    const specialization = this.teacherForm.specialization.trim();
    const contractType = this.teacherForm.contractType;
    const hireDate = this.teacherForm.hireDate;

    if (!this.isTeacherFormValid()) {
      return;
    }

    const currentId = this.editingTeacherId();
    const basePayload = {
      first_name: firstName,
      last_name: lastName,
      email,
      numero_empleado: employeeId,
      telefono: phone,
      departamento: department,
      especializacion: specialization,
      tipo_contrato: contractType,
      fecha_contratacion: hireDate || null,
      is_active: true
    };

    if (currentId !== null) {
      const payload: Partial<{ password: string }> & typeof basePayload = { ...basePayload };
      if (password) {
        payload.password = password;
      }

      this.adminService.updateDocente(currentId, payload as unknown as DocenteUpdate).subscribe({
        next: (response) => {
          const mapped = this.mapApiDocenteToTeacherItem(response as unknown as ApiDocente);
          this.teachers.update((items) =>
            items.map((item) =>
              item.id === currentId
                ? {
                  ...item,
                  ...mapped,
                  phone,
                  department,
                  specialization,
                  contractType,
                  hireDate
                }
                : item
            )
          );
          this.closeTeacherModal();
        },
        error: (error) => alert(`No se pudo actualizar el docente. ${this.getApiErrorMessage(error)}`)
      });
      return;
    }

    const createPayload = { ...basePayload, password };
    this.adminService.createDocente(createPayload as unknown as DocenteCreate).subscribe({
      next: (response) => {
        const mapped = this.mapApiDocenteToTeacherItem(response as unknown as ApiDocente);
        this.teachers.update((items) => [
          ...items,
          {
            ...mapped,
            phone,
            department,
            specialization,
            contractType,
            hireDate,
            courses: 0
          }
        ]);
        this.closeTeacherModal();
      },
      error: (error) => alert(`No se pudo guardar el docente. ${this.getApiErrorMessage(error)}`)
    });
  }

  openCreateStudentModal(): void {
    this.editingStudentId.set(null);
    this.studentForm = {
      firstName: '',
      lastName: '',
      enrollment: '',
      email: '',
      password: '',
      phone: '',
      program: '',
      semester: '1° Semestre',
      enrollmentDate: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      isActive: true
    };
    this.showStudentModal.set(true);
  }

  openEditStudentModal(id: number): void {
    const selectedStudent = this.students().find((item) => item.id === id);

    if (!selectedStudent) {
      return;
    }

    this.editingStudentId.set(id);
    this.studentForm = {
      firstName: selectedStudent.firstName,
      lastName: selectedStudent.lastName,
      enrollment: selectedStudent.enrollment,
      email: selectedStudent.email,
      password: '',
      phone: selectedStudent.phone,
      program: selectedStudent.program,
      semester: this.normalizeSemesterForSelect(selectedStudent.semester),
      enrollmentDate: selectedStudent.enrollmentDate,
      address: selectedStudent.address,
      emergencyContactName: selectedStudent.emergencyContactName,
      emergencyContactPhone: selectedStudent.emergencyContactPhone,
      isActive: selectedStudent.status === 'Activo'
    };
    this.showStudentModal.set(true);
  }

  closeStudentModal(): void {
    this.showStudentModal.set(false);
  }

  onStudentNameInput(event: Event, field: 'firstName' | 'lastName' | 'emergencyContactName'): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    this.studentForm[field] = cleaned;
    input.value = cleaned;
  }

  onStudentEnrollmentInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.substring(0, 9);
    this.studentForm.enrollment = cleaned;
    input.value = cleaned;
  }

  onStudentPhoneInput(event: Event, field: 'phone' | 'emergencyContactPhone'): void {
    const input = event.target as HTMLInputElement;
    const cleaned = ('' + input.value).replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 0 && cleaned.length <= 3) {
      formatted = cleaned;
    } else if (cleaned.length > 3 && cleaned.length <= 6) {
      formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
    } else if (cleaned.length > 6) {
      formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)} ${cleaned.substring(6, 10)}`;
    }

    this.studentForm[field] = formatted;
    input.value = formatted;
  }

  isStudentFormValid(): boolean {
    const f = this.studentForm;
    if (!f.firstName.trim() || !f.lastName.trim() || !f.enrollment.trim() || !f.email.trim() || !f.program || !f.semester || !f.enrollmentDate) {
      return false;
    }
    const password = f.password.trim();
    if (this.editingStudentId() === null && !password) {
      return false;
    }
    if (password && password.length < 6) {
      return false;
    }
    if (f.enrollment.trim().length !== 9) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(f.email.trim())) {
      return false;
    }
    return true;
  }

  saveStudent(): void {
    if (this.editingStudentId() !== null) {
      this.openUpdateConfirmation(this.getRecordLabel('estudiantes', this.editingStudentId()), () => this.executeSaveStudent());
      return;
    }

    this.executeSaveStudent();
  }

  private executeSaveStudent(): void {
    const firstName = this.studentForm.firstName.trim();
    const lastName = this.studentForm.lastName.trim();
    const enrollment = this.studentForm.enrollment.trim().toUpperCase();
    const email = this.studentForm.email.trim().toLowerCase();
    const password = this.studentForm.password.trim();
    const phone = this.studentForm.phone.trim();
    const program = this.studentForm.program;
    const semester = this.studentForm.semester;
    const enrollmentDate = this.studentForm.enrollmentDate;
    const address = this.studentForm.address.trim();
    const emergencyContactName = this.studentForm.emergencyContactName.trim();
    const emergencyContactPhone = this.studentForm.emergencyContactPhone.trim();
    const status: 'Activo' | 'Inactivo' = this.studentForm.isActive ? 'Activo' : 'Inactivo';

    if (!this.isStudentFormValid()) {
      return;
    }

    const tableSemester = semester.replace(' Semestre', '');
    const currentId = this.editingStudentId();

    const basePayload = {
      first_name: firstName,
      last_name: lastName,
      email,
      matricula: enrollment,
      telefono: phone,
      programa: program,
      semestre: tableSemester,
      fecha_inscripcion: enrollmentDate || null,
      direccion: address,
      contacto_emergencia_nombre: emergencyContactName,
      contacto_emergencia_telefono: emergencyContactPhone,
      is_active: status === 'Activo'
    };

    if (currentId !== null) {
      const payload: Partial<{ password: string }> & typeof basePayload = { ...basePayload };
      if (password) {
        payload.password = password;
      }

      this.adminService.updateEstudiante(currentId, payload as unknown as EstudianteUpdate).subscribe({
        next: (response) => {
          const mapped = this.mapApiEstudianteToStudentItem(response as unknown as ApiEstudiante);
          this.students.update((items) => items.map((item) => (item.id === currentId ? mapped : item)));
          this.closeStudentModal();
        },
        error: (error) => alert(`No se pudo actualizar el estudiante. ${this.getApiErrorMessage(error)}`)
      });
      return;
    }

    const createPayload = { ...basePayload, password };
    this.adminService.createEstudiante(createPayload as unknown as EstudianteCreate).subscribe({
      next: (response) => {
        const mapped = this.mapApiEstudianteToStudentItem(response as unknown as ApiEstudiante);
        this.students.update((items) => [...items, mapped]);
        this.closeStudentModal();
      },
      error: (error) => alert(`No se pudo guardar el estudiante. ${this.getApiErrorMessage(error)}`)
    });
  }

  private normalizeSemesterForSelect(semester: string): string {
    if (semester.includes('Semestre')) {
      return semester;
    }

    return `${semester} Semestre`;
  }

  private loadAllFromStorage(): void {
    this.periods.set(this.readFromStorage<PeriodItem>(this.storageKeys.periods, this.periods()));
    this.subjects.set(this.readFromStorage<SubjectItem>(this.storageKeys.subjects, this.subjects()));
    this.groups.set(this.readFromStorage<GroupItem>(this.storageKeys.groups, this.groups()));
    this.classrooms.set(this.readFromStorage<ClassroomItem>(this.storageKeys.classrooms, this.classrooms()));
    this.teachers.set(this.readFromStorage<TeacherItem>(this.storageKeys.teachers, this.teachers()));
    this.students.set(this.readFromStorage<StudentItem>(this.storageKeys.students, this.students()));
  }

  private loadPeriodsFromApi(): void {
    this.adminService.getPeriodos().subscribe({
      next: (periodos) => {
        const mapped = (periodos as unknown as ApiPeriodo[]).map((periodo) => this.mapApiPeriodoToPeriodItem(periodo));
        this.periods.set(mapped);
      }
    });
  }

  private loadSubjectsFromApi(): void {
    this.adminService.getMaterias().subscribe({
      next: (materias) => {
        const mapped = (materias as unknown as ApiMateria[]).map((materia) => this.mapApiMateriaToSubjectItem(materia));
        this.subjects.set(mapped);
      }
    });
  }

  private loadGroupsFromApi(): void {
    this.adminService.getGrupos().subscribe({
      next: (grupos) => {
        const mapped = (grupos as unknown as ApiGrupo[]).map((grupo) => this.mapApiGrupoToGroupItem(grupo));
        this.groups.set(mapped);
        this.syncTeacherCourseCounts();
      }
    });
  }

  private loadClassroomsFromApi(): void {
    this.adminService.getAulas().subscribe({
      next: (aulas) => {
        const mapped = (aulas as unknown as ApiAula[]).map((aula) => this.mapApiAulaToClassroomItem(aula));
        this.classrooms.set(mapped);
      }
    });
  }

  private loadUsersFromApi(): void {
    this.adminService.getDocentes().subscribe({
      next: (docentes) => {
        const docentesApi = docentes as unknown as ApiDocente[];
        const legacyTeachers = this.readFromStorage<TeacherItem>(this.storageKeys.teachers, []);
        this.backfillTeachersFromLegacyStorage(docentesApi);
        const mapped = docentesApi.map((docente) => {
          const apiTeacher = this.mapApiDocenteToTeacherItem(docente);
          const legacyTeacher = legacyTeachers.find((item) => this.isSameTeacher(docente, item));
          return legacyTeacher ? this.mergeTeacherData(apiTeacher, legacyTeacher) : apiTeacher;
        });
        this.teachers.set(mapped);
        this.syncTeacherCourseCounts();
      }
    });

    this.adminService.getEstudiantes().subscribe({
      next: (estudiantes) => {
        const mapped = (estudiantes as unknown as ApiEstudiante[]).map((estudiante) => this.mapApiEstudianteToStudentItem(estudiante));
        this.students.set(mapped);
      }
    });
  }

  private registerPersistenceEffects(): void {
    effect(() => this.writeToStorage(this.storageKeys.periods, this.periods()));
    effect(() => this.writeToStorage(this.storageKeys.subjects, this.subjects()));
    effect(() => this.writeToStorage(this.storageKeys.groups, this.groups()));
    effect(() => this.writeToStorage(this.storageKeys.classrooms, this.classrooms()));
    effect(() => this.writeToStorage(this.storageKeys.teachers, this.teachers()));
    effect(() => this.writeToStorage(this.storageKeys.students, this.students()));
  }

  private readFromStorage<T>(key: string, fallback: T[]): T[] {
    if (!this.canUseLocalStorage()) {
      return fallback;
    }

    try {
      const rawValue = localStorage.getItem(key);

      if (!rawValue) {
        return fallback;
      }

      const parsedValue = JSON.parse(rawValue);
      return Array.isArray(parsedValue) ? parsedValue as T[] : fallback;
    } catch {
      return fallback;
    }
  }

  private writeToStorage<T>(key: string, value: T[]): void {
    if (!this.canUseLocalStorage()) {
      return;
    }

    localStorage.setItem(key, JSON.stringify(value));
  }

  private canUseLocalStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  private mapApiDocenteToTeacherItem(docente: ApiDocente): TeacherItem {
    const firstName = docente.usuario?.first_name?.trim() ?? '';
    const lastName = docente.usuario?.last_name?.trim() ?? '';

    return {
      id: docente.usuario?.id ?? 0,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim() || docente.usuario?.email || 'Docente',
      employeeId: docente.numero_empleado,
      email: docente.usuario?.email ?? '',
      phone: docente.telefono ?? '',
      department: docente.departamento ?? '',
      specialization: docente.especializacion ?? '',
      contractType: docente.tipo_contrato ?? 'Tiempo Completo',
      hireDate: docente.fecha_contratacion ?? '',
      officeHours: docente.horario_atencion ?? '',
      cubicle: docente.cubiculo ?? '',
      courses: 0
    };
  }

  private backfillTeachersFromLegacyStorage(docentes: ApiDocente[]): void {
    const legacyTeachers = this.readFromStorage<TeacherItem>(this.storageKeys.teachers, []);

    if (legacyTeachers.length === 0) {
      return;
    }

    for (const docente of docentes) {
      const legacyMatch = legacyTeachers.find((legacyTeacher) => this.isSameTeacher(docente, legacyTeacher));

      if (!legacyMatch) {
        continue;
      }

      const payload = this.buildTeacherBackfillPayload(docente, legacyMatch);
      if (!payload) {
        continue;
      }

      const docenteId = docente.usuario?.id;
      if (!docenteId) {
        continue;
      }

      this.adminService.updateDocente(docenteId, payload as unknown as DocenteUpdate).subscribe({
        next: (updatedDocente) => {
          const mapped = this.mapApiDocenteToTeacherItem(updatedDocente as unknown as ApiDocente);
          this.teachers.update((items) => {
            const index = items.findIndex((item) => item.id === mapped.id);
            if (index === -1) {
              return [...items, mapped];
            }

            return items.map((item) => item.id === mapped.id ? mapped : item);
          });
        },
        error: () => {
          // La migracion es de rescate y no debe bloquear la carga del CRUD.
        }
      });
    }
  }

  private buildTeacherBackfillPayload(docente: ApiDocente, legacyTeacher: TeacherItem): Record<string, unknown> | null {
    const payload: Record<string, unknown> = {};

    if (!docente.telefono?.trim() && legacyTeacher.phone.trim()) {
      payload['telefono'] = legacyTeacher.phone.trim();
    }

    if (!docente.departamento?.trim() && legacyTeacher.department.trim()) {
      payload['departamento'] = legacyTeacher.department.trim();
    }

    if (!docente.especializacion?.trim() && legacyTeacher.specialization.trim()) {
      payload['especializacion'] = legacyTeacher.specialization.trim();
    }

    if (!docente.tipo_contrato?.trim() && legacyTeacher.contractType.trim()) {
      payload['tipo_contrato'] = legacyTeacher.contractType.trim();
    }

    if (!docente.fecha_contratacion && legacyTeacher.hireDate.trim()) {
      payload['fecha_contratacion'] = legacyTeacher.hireDate.trim();
    }

    if (!docente.horario_atencion?.trim() && legacyTeacher.officeHours?.trim()) {
      payload['horario_atencion'] = legacyTeacher.officeHours.trim();
    }

    if (!docente.cubiculo?.trim() && legacyTeacher.cubicle?.trim()) {
      payload['cubiculo'] = legacyTeacher.cubicle.trim();
    }

    return Object.keys(payload).length > 0 ? payload : null;
  }

  private mergeTeacherData(apiTeacher: TeacherItem, legacyTeacher: TeacherItem): TeacherItem {
    return {
      ...apiTeacher,
      phone: apiTeacher.phone.trim() || legacyTeacher.phone.trim(),
      department: apiTeacher.department.trim() || legacyTeacher.department.trim(),
      specialization: apiTeacher.specialization.trim() || legacyTeacher.specialization.trim(),
      contractType: this.isTeacherContractDefault(apiTeacher.contractType)
        ? legacyTeacher.contractType.trim() || apiTeacher.contractType
        : apiTeacher.contractType,
      hireDate: apiTeacher.hireDate.trim() || legacyTeacher.hireDate.trim(),
      officeHours: apiTeacher.officeHours?.trim() || legacyTeacher.officeHours?.trim() || '',
      cubicle: apiTeacher.cubicle?.trim() || legacyTeacher.cubicle?.trim() || '',
      courses: apiTeacher.courses || legacyTeacher.courses,
    };
  }

  private isTeacherContractDefault(contractType: string): boolean {
    return !contractType.trim() || contractType.trim() === 'Tiempo Completo';
  }

  private isSameTeacher(docente: ApiDocente, legacyTeacher: TeacherItem): boolean {
    const docenteId = docente.usuario?.id ?? 0;
    if (docenteId && legacyTeacher.id === docenteId) {
      return true;
    }

    const apiEmployeeId = docente.numero_empleado?.trim().toUpperCase() ?? '';
    const legacyEmployeeId = legacyTeacher.employeeId.trim().toUpperCase();
    if (apiEmployeeId && legacyEmployeeId && apiEmployeeId === legacyEmployeeId) {
      return true;
    }

    const apiEmail = docente.usuario?.email?.trim().toLowerCase() ?? '';
    const legacyEmail = legacyTeacher.email.trim().toLowerCase();
    return !!apiEmail && !!legacyEmail && apiEmail === legacyEmail;
  }

  private mapApiEstudianteToStudentItem(estudiante: ApiEstudiante): StudentItem {
    const firstName = estudiante.usuario?.first_name?.trim() ?? '';
    const lastName = estudiante.usuario?.last_name?.trim() ?? '';

    return {
      id: estudiante.usuario?.id ?? 0,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim() || estudiante.usuario?.email || 'Estudiante',
      enrollment: estudiante.matricula,
      email: estudiante.usuario?.email ?? '',
      phone: estudiante.telefono ?? '',
      program: estudiante.programa ?? '',
      semester: estudiante.semestre ?? '1°',
      enrollmentDate: estudiante.fecha_inscripcion ?? '',
      address: estudiante.direccion ?? '',
      emergencyContactName: estudiante.contacto_emergencia_nombre ?? '',
      emergencyContactPhone: estudiante.contacto_emergencia_telefono ?? '',
      status: estudiante.usuario?.is_active ? 'Activo' : 'Inactivo',
      enrolledCourses: (estudiante.grupos ?? []).map((grupo) => ({
        id: grupo.id,
        code: grupo.codigo,
        subject: grupo.materia,
      }))
    };
  }

  private mapApiPeriodoToPeriodItem(periodo: ApiPeriodo): PeriodItem {
    return {
      id: periodo.id,
      name: periodo.nombre,
      startDate: periodo.fecha_inicio,
      endDate: periodo.fecha_fin,
      status: periodo.estado
    };
  }

  private mapApiMateriaToSubjectItem(materia: ApiMateria): SubjectItem {
    return {
      id: materia.id,
      code: materia.codigo,
      name: materia.nombre,
      credits: materia.creditos,
      department: materia.area_academica
    };
  }

  private mapApiGrupoToGroupItem(grupo: ApiGrupo): GroupItem {
    const normalizedDays = this.normalizeGroupDays(grupo.dia_semana);
    const enrolledStudents = (grupo.estudiantes ?? []).map((student) => ({
      id: student.id,
      enrollment: student.matricula,
      name: student.nombre,
      email: student.email,
      program: student.programa,
      semester: student.semestre,
      enrollmentDate: student.fecha_inscripcion ?? '',
    }));

    return {
      id: grupo.id,
      code: grupo.codigo,
      subject: grupo.materia,
      teacher: grupo.docente,
      classroomId: grupo.aula?.id ?? null,
      classroomName: this.formatClassroomLabel(grupo.aula),
      students: enrolledStudents.length || grupo.inscritos,
      semester: grupo.semestre,
      days: normalizedDays,
      day: normalizedDays[0] ?? '',
      startTime: this.normalizeApiTime(grupo.hora_inicio),
      endTime: this.normalizeApiTime(grupo.hora_fin),
      maxCapacity: grupo.cupo_max,
      studentIds: enrolledStudents.map((student) => student.id),
      enrolledStudents,
    };
  }

  private formatClassroomLabel(aula: ApiGrupo['aula'] | ApiStudentGroup['aula']): string {
    if (!aula) {
      return 'Sin aula asignada';
    }

    return `${aula.edificio} • ${aula.numero}`;
  }

  private syncTeacherCourseCounts(): void {
    const courseCountByTeacher = new Map<string, number>();

    for (const group of this.groups()) {
      const teacherName = group.teacher.trim().toLowerCase();
      if (!teacherName) {
        continue;
      }

      courseCountByTeacher.set(teacherName, (courseCountByTeacher.get(teacherName) ?? 0) + 1);
    }

    this.teachers.update((items) => items.map((teacher) => ({
      ...teacher,
      courses: courseCountByTeacher.get(teacher.name.trim().toLowerCase()) ?? 0,
    })));
  }

  getGroupDaysLabel(group: GroupItem): string {
    const days = this.getGroupDays(group);

    if (days.length === 0) {
      return 'Sin asignar';
    }

    return days.join(', ');
  }

  getGroupScheduleLabel(group: GroupItem): string {
    if (!group.startTime || !group.endTime) {
      return 'Sin horario';
    }

    return `${group.startTime} - ${group.endTime}`;
  }

  private getGroupDays(group: GroupItem): string[] {
    return this.normalizeGroupDays(group.days ?? group.day);
  }

  private mapApiAulaToClassroomItem(aula: ApiAula): ClassroomItem {
    const normalizedStatus = this.normalizeClassroomStatus(aula.estado);

    return {
      id: aula.id,
      name: aula.numero,
      building: aula.edificio,
      capacity: aula.capacidad,
      status: normalizedStatus,
      resources: Array.isArray(aula.recursos) ? aula.recursos : []
    };
  }

  private normalizeClassroomStatus(status: string | null | undefined): ClassroomStatus {
    if (status === 'Ocupado' || status === 'Fuera de servicio') {
      return status;
    }

    if (status === 'En uso') {
      return 'Ocupado';
    }

    return 'Disponible';
  }

  private normalizeApiTime(time: string | null | undefined): string {
    if (!time) {
      return '';
    }

    return time.slice(0, 5);
  }

  private normalizeGroupDays(days: string[] | string | null | undefined): string[] {
    if (Array.isArray(days)) {
      return days.filter((day) => typeof day === 'string' && day.trim().length > 0);
    }

    if (typeof days === 'string' && days.trim()) {
      return [days.trim()];
    }

    return [];
  }

  private getApiErrorMessage(error: unknown): string {
    const fallback = 'Revisa los datos e intenta de nuevo.';
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

  private getTabSingularLabel(tab: GestionTabKey): string {
    switch (tab) {
      case 'periodos':
        return 'periodo';
      case 'materias':
        return 'materia';
      case 'grupos':
        return 'grupo';
      case 'aulas':
        return 'aula';
      case 'docentes':
        return 'docente';
      case 'estudiantes':
        return 'estudiante';
    }
  }

  private getRecordLabel(tab: GestionTabKey, id: number | null): string {
    if (id === null) {
      return `el ${this.getTabSingularLabel(tab)}`;
    }

    switch (tab) {
      case 'periodos': {
        const item = this.periods().find((period) => period.id === id);
        return item ? `el periodo ${item.name}` : 'el periodo seleccionado';
      }
      case 'materias': {
        const item = this.subjects().find((subject) => subject.id === id);
        return item ? `la materia ${item.name}` : 'la materia seleccionada';
      }
      case 'grupos': {
        const item = this.groups().find((group) => group.id === id);
        return item ? `el grupo ${item.code}` : 'el grupo seleccionado';
      }
      case 'aulas': {
        const item = this.classrooms().find((classroom) => classroom.id === id);
        return item ? `el aula ${item.name}` : 'el aula seleccionada';
      }
      case 'docentes': {
        const item = this.teachers().find((teacher) => teacher.id === id);
        return item ? `el docente ${item.name}` : 'el docente seleccionado';
      }
      case 'estudiantes': {
        const item = this.students().find((student) => student.id === id);
        return item ? `el estudiante ${item.name}` : 'el estudiante seleccionado';
      }
    }
  }
}
