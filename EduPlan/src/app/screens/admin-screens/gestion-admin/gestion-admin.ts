import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocenteCreate, DocenteUpdate, EstudianteCreate, EstudianteUpdate, GrupoCreate, GrupoUpdate, MateriaCreate, MateriaUpdate, PeriodoCreate, PeriodoUpdate } from '../../../models/admin.models';
import { AdminService } from '../../../services/admin.service';

type GestionTabKey = 'periodos' | 'materias' | 'grupos' | 'aulas' | 'docentes' | 'estudiantes';
type PeriodStatus = 'Activo' | 'Finalizado';

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
  students: number;
  semester: string;
  maxCapacity: number;
}

interface GroupFormModel {
  name: string;
  subject: string;
  semester: string;
  maxCapacity: number;
}

type ClassroomStatus = 'Disponible' | 'En uso';

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
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  contractType: string;
  hireDate: string;
  courses: number;
}

interface TeacherFormModel {
  name: string;
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
}

interface StudentFormModel {
  name: string;
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
}

interface ApiEstudiante {
  usuario: ApiUser;
  matricula: string;
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
  semestre: string;
  cupo_max: number;
  inscritos: number;
}

@Component({
  selector: 'app-general-management',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink, FormsModule],
  templateUrl: './gestion-admin.html',
  styleUrls: ['./gestion-admin.scss']
})
export class GestionAdminComponent {
  private readonly adminService = inject(AdminService);

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
      students: 35,
      semester: '5° semestre',
      maxCapacity: 35
    },
    {
      id: 2,
      code: 'CS302-B',
      subject: 'Estructuras de Datos Avanzadas',
      teacher: 'Dra. María González',
      students: 28,
      semester: '5° semestre',
      maxCapacity: 28
    }
  ]);

  showGroupModal = signal(false);
  editingGroupId = signal<number | null>(null);
  groupForm: GroupFormModel = {
    name: '',
    subject: '',
    semester: '',
    maxCapacity: 40
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
      status: 'En uso',
      resources: ['Equipo Especializado', 'Aire Acondicionado']
    }
  ]);

  showClassroomModal = signal(false);
  editingClassroomId = signal<number | null>(null);
  buildingOptions = ['Edificio A', 'Edificio B', 'Edificio C'];
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
    name: '',
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
      status: 'Activo'
    },
    {
      id: 2,
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
      status: 'Activo'
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
    name: '',
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

  constructor() {
    this.loadAllFromStorage();
    this.registerPersistenceEffects();
    this.loadPeriodsFromApi();
    this.loadSubjectsFromApi();
    this.loadGroupsFromApi();
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
          next: () => this.groups.update((items) => items.filter((item) => item.id !== id)),
          error: (error) => alert(`No se pudo eliminar el grupo. ${this.getApiErrorMessage(error)}`)
        });
        break;
      case 'aulas':
        this.classrooms.update((items) => items.filter((item) => item.id !== id));
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
      semester: '',
      maxCapacity: 40
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
      semester: selectedGroup.semester,
      maxCapacity: selectedGroup.maxCapacity
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

  isGroupFormValid(): boolean {
    const f = this.groupForm;
    if (!f.name.trim() || !f.subject || !f.semester.trim() || !f.maxCapacity || this.isGroupNameTaken()) {
      return false;
    }
    const nameRegex = /^[A-Z0-9]{5}-[A-Z]$/;
    if (!nameRegex.test(f.name.trim())) {
      return false;
    }
    return true;
  }

  saveGroup(): void {
    const name = this.groupForm.name.trim();
    const subject = this.groupForm.subject;
    const semester = this.groupForm.semester.trim();
    const maxCapacity = Number(this.groupForm.maxCapacity);

    if (!this.isGroupFormValid()) {
      return;
    }

    const teacher = this.resolveTeacherBySubject(subject);
    const currentId = this.editingGroupId();
    const payload = {
      codigo: name,
      materia: subject,
      docente: teacher,
      semestre: semester,
      cupo_max: maxCapacity,
      inscritos: maxCapacity
    };

    if (currentId !== null) {
      this.adminService.updateGrupo(currentId, payload as unknown as GrupoUpdate).subscribe({
        next: (grupo) => {
          const mapped = this.mapApiGrupoToGroupItem(grupo as unknown as ApiGrupo);
          this.groups.update((items) => items.map((item) => (item.id === currentId ? mapped : item)));
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
    const building = this.classroomForm.building;
    const name = this.classroomForm.name.trim();
    const capacity = Number(this.classroomForm.capacity);
    const resources = [...this.classroomForm.resources];

    if (!this.isClassroomFormValid()) {
      return;
    }

    const currentId = this.editingClassroomId();

    if (currentId !== null) {
      this.classrooms.update((items) =>
        items.map((item) =>
          item.id === currentId
            ? { ...item, building, name, capacity, resources }
            : item
        )
      );
    } else {
      const nextId = this.classrooms().length > 0
        ? Math.max(...this.classrooms().map((item) => item.id)) + 1
        : 1;

      this.classrooms.update((items) => [
        ...items,
        {
          id: nextId,
          building,
          name,
          capacity,
          resources,
          status: 'Disponible'
        }
      ]);
    }

    this.closeClassroomModal();
  }

  openCreateTeacherModal(): void {
    this.editingTeacherId.set(null);
    this.teacherForm = {
      name: '',
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
      name: selectedTeacher.name,
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

  onTeacherNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\.\s]/g, '');
    this.teacherForm.name = cleaned;
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
    if (!f.name.trim() || !f.employeeId.trim() || !f.email.trim() || !f.department || !f.contractType || !f.hireDate) {
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
    const name = this.teacherForm.name.trim();
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

    const nameParts = this.splitFullName(name);
    const currentId = this.editingTeacherId();
    const basePayload = {
      first_name: nameParts.firstName,
      last_name: nameParts.lastName,
      email,
      numero_empleado: employeeId,
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
      name: '',
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
      name: selectedStudent.name,
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

  onStudentNameInput(event: Event, field: 'name' | 'emergencyContactName'): void {
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
    if (!f.name.trim() || !f.enrollment.trim() || !f.email.trim() || !f.program || !f.semester || !f.enrollmentDate) {
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
    const name = this.studentForm.name.trim();
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
    const nameParts = this.splitFullName(name);
    const currentId = this.editingStudentId();

    const basePayload = {
      first_name: nameParts.firstName,
      last_name: nameParts.lastName,
      email,
      matricula: enrollment,
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
          this.students.update((items) =>
            items.map((item) =>
              item.id === currentId
                ? {
                  ...item,
                  ...mapped,
                  phone,
                  program,
                  semester: tableSemester,
                  enrollmentDate,
                  address,
                  emergencyContactName,
                  emergencyContactPhone
                }
                : item
            )
          );
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
        this.students.update((items) => [
          ...items,
          {
            ...mapped,
            phone,
            program,
            semester: tableSemester,
            enrollmentDate,
            address,
            emergencyContactName,
            emergencyContactPhone
          }
        ]);
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

  private resolveTeacherBySubject(subject: string): string {
    const mapping: Record<string, string> = {
      'Programación Orientada a Objetos': 'Prof. Carlos Ruiz',
      'Estructuras de Datos Avanzadas': 'Dra. María González',
      'Matemáticas Discretas': 'Dr. José Hernández'
    };

    return mapping[subject] ?? 'Docente por asignar';
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
      }
    });
  }

  private loadUsersFromApi(): void {
    this.adminService.getDocentes().subscribe({
      next: (docentes) => {
        const mapped = (docentes as unknown as ApiDocente[]).map((docente) => this.mapApiDocenteToTeacherItem(docente));
        this.teachers.set(mapped);
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

  private splitFullName(fullName: string): { firstName: string; lastName: string } {
    const cleaned = fullName.trim().replace(/\s+/g, ' ');

    if (!cleaned) {
      return { firstName: '', lastName: '' };
    }

    const parts = cleaned.split(' ');
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' ')
    };
  }

  private mapApiDocenteToTeacherItem(docente: ApiDocente): TeacherItem {
    const firstName = docente.usuario?.first_name?.trim() ?? '';
    const lastName = docente.usuario?.last_name?.trim() ?? '';

    return {
      id: docente.usuario?.id ?? 0,
      name: `${firstName} ${lastName}`.trim() || docente.usuario?.email || 'Docente',
      employeeId: docente.numero_empleado,
      email: docente.usuario?.email ?? '',
      phone: '',
      department: '',
      specialization: '',
      contractType: 'Tiempo Completo',
      hireDate: '',
      courses: 0
    };
  }

  private mapApiEstudianteToStudentItem(estudiante: ApiEstudiante): StudentItem {
    const firstName = estudiante.usuario?.first_name?.trim() ?? '';
    const lastName = estudiante.usuario?.last_name?.trim() ?? '';

    return {
      id: estudiante.usuario?.id ?? 0,
      name: `${firstName} ${lastName}`.trim() || estudiante.usuario?.email || 'Estudiante',
      enrollment: estudiante.matricula,
      email: estudiante.usuario?.email ?? '',
      phone: '',
      program: '',
      semester: '1°',
      enrollmentDate: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      status: estudiante.usuario?.is_active ? 'Activo' : 'Inactivo'
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
    return {
      id: grupo.id,
      code: grupo.codigo,
      subject: grupo.materia,
      teacher: grupo.docente,
      students: grupo.inscritos,
      semester: grupo.semestre,
      maxCapacity: grupo.cupo_max
    };
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
}
