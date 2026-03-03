import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  phone: string;
  program: string;
  semester: string;
  enrollmentDate: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  isActive: boolean;
}

@Component({
  selector: 'app-general-management',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink, FormsModule],
  templateUrl: './gestion-admin.html',
  styleUrls: ['./gestion-admin.scss']
})
export class GestionAdminComponent {
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
        this.periods.update((items) => items.filter((item) => item.id !== id));
        break;
      case 'materias':
        this.subjects.update((items) => items.filter((item) => item.id !== id));
        break;
      case 'grupos':
        this.groups.update((items) => items.filter((item) => item.id !== id));
        break;
      case 'aulas':
        this.classrooms.update((items) => items.filter((item) => item.id !== id));
        break;
      case 'docentes':
        this.teachers.update((items) => items.filter((item) => item.id !== id));
        break;
      case 'estudiantes':
        this.students.update((items) => items.filter((item) => item.id !== id));
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

  savePeriod(): void {
    const name = this.periodForm.name.trim();
    const startDate = this.periodForm.startDate;
    const endDate = this.periodForm.endDate;

    if (!name || !startDate || !endDate) {
      return;
    }

    const status: PeriodStatus = this.periodForm.isActive ? 'Activo' : 'Finalizado';
    const currentId = this.editingPeriodId();

    if (currentId !== null) {
      this.periods.update((items) =>
        items.map((item) =>
          item.id === currentId
            ? { ...item, name, startDate, endDate, status }
            : item
        )
      );
    } else {
      const nextId = this.periods().length > 0
        ? Math.max(...this.periods().map((item) => item.id)) + 1
        : 1;

      this.periods.update((items) => [
        ...items,
        { id: nextId, name, startDate, endDate, status }
      ]);
    }

    this.closePeriodModal();
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

  saveSubject(): void {
    const name = this.subjectForm.name.trim();
    const code = this.subjectForm.code.trim().toUpperCase();
    const credits = Number(this.subjectForm.credits);
    const department = this.subjectForm.department;

    if (!name || !code || !credits || !department) {
      return;
    }

    const currentId = this.editingSubjectId();

    if (currentId !== null) {
      this.subjects.update((items) =>
        items.map((item) =>
          item.id === currentId
            ? { ...item, name, code, credits, department }
            : item
        )
      );
    } else {
      const nextId = this.subjects().length > 0
        ? Math.max(...this.subjects().map((item) => item.id)) + 1
        : 1;

      this.subjects.update((items) => [
        ...items,
        { id: nextId, name, code, credits, department }
      ]);
    }

    this.closeSubjectModal();
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

  saveGroup(): void {
    const name = this.groupForm.name.trim();
    const subject = this.groupForm.subject;
    const semester = this.groupForm.semester.trim();
    const maxCapacity = Number(this.groupForm.maxCapacity);

    if (!name || !subject || !semester || !maxCapacity || this.isGroupNameTaken()) {
      return;
    }

    const teacher = this.resolveTeacherBySubject(subject);
    const currentId = this.editingGroupId();

    if (currentId !== null) {
      this.groups.update((items) =>
        items.map((item) =>
          item.id === currentId
            ? {
              ...item,
              code: name,
              subject,
              semester,
              maxCapacity,
              students: maxCapacity,
              teacher
            }
            : item
        )
      );
    } else {
      const nextId = this.groups().length > 0
        ? Math.max(...this.groups().map((item) => item.id)) + 1
        : 1;

      this.groups.update((items) => [
        ...items,
        {
          id: nextId,
          code: name,
          subject,
          semester,
          maxCapacity,
          students: maxCapacity,
          teacher
        }
      ]);
    }

    this.closeGroupModal();
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

  saveClassroom(): void {
    const building = this.classroomForm.building;
    const name = this.classroomForm.name.trim();
    const capacity = Number(this.classroomForm.capacity);
    const resources = [...this.classroomForm.resources];

    if (!building || !name || !capacity) {
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

  saveTeacher(): void {
    const name = this.teacherForm.name.trim();
    const employeeId = this.teacherForm.employeeId.trim().toUpperCase();
    const email = this.teacherForm.email.trim().toLowerCase();
    const phone = this.teacherForm.phone.trim();
    const department = this.teacherForm.department;
    const specialization = this.teacherForm.specialization.trim();
    const contractType = this.teacherForm.contractType;
    const hireDate = this.teacherForm.hireDate;

    if (!name || !employeeId || !email || !department || !contractType || !hireDate) {
      return;
    }

    const currentId = this.editingTeacherId();

    if (currentId !== null) {
      this.teachers.update((items) =>
        items.map((item) =>
          item.id === currentId
            ? {
              ...item,
              name,
              employeeId,
              email,
              phone,
              department,
              specialization,
              contractType,
              hireDate
            }
            : item
        )
      );
    } else {
      const nextId = this.teachers().length > 0
        ? Math.max(...this.teachers().map((item) => item.id)) + 1
        : 1;

      this.teachers.update((items) => [
        ...items,
        {
          id: nextId,
          name,
          employeeId,
          email,
          phone,
          department,
          specialization,
          contractType,
          hireDate,
          courses: 0
        }
      ]);
    }

    this.closeTeacherModal();
  }

  openCreateStudentModal(): void {
    this.editingStudentId.set(null);
    this.studentForm = {
      name: '',
      enrollment: '',
      email: '',
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

  saveStudent(): void {
    const name = this.studentForm.name.trim();
    const enrollment = this.studentForm.enrollment.trim().toUpperCase();
    const email = this.studentForm.email.trim().toLowerCase();
    const phone = this.studentForm.phone.trim();
    const program = this.studentForm.program;
    const semester = this.studentForm.semester;
    const enrollmentDate = this.studentForm.enrollmentDate;
    const address = this.studentForm.address.trim();
    const emergencyContactName = this.studentForm.emergencyContactName.trim();
    const emergencyContactPhone = this.studentForm.emergencyContactPhone.trim();
    const status: 'Activo' | 'Inactivo' = this.studentForm.isActive ? 'Activo' : 'Inactivo';

    if (!name || !enrollment || !email || !program || !semester || !enrollmentDate) {
      return;
    }

    const tableSemester = semester.replace(' Semestre', '');
    const currentId = this.editingStudentId();

    if (currentId !== null) {
      this.students.update((items) =>
        items.map((item) =>
          item.id === currentId
            ? {
              ...item,
              name,
              enrollment,
              email,
              phone,
              program,
              semester: tableSemester,
              enrollmentDate,
              address,
              emergencyContactName,
              emergencyContactPhone,
              status
            }
            : item
        )
      );
    } else {
      const nextId = this.students().length > 0
        ? Math.max(...this.students().map((item) => item.id)) + 1
        : 1;

      this.students.update((items) => [
        ...items,
        {
          id: nextId,
          name,
          enrollment,
          email,
          phone,
          program,
          semester: tableSemester,
          enrollmentDate,
          address,
          emergencyContactName,
          emergencyContactPhone,
          status
        }
      ]);
    }

    this.closeStudentModal();
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
}
