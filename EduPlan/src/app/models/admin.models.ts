export type RegistroEstado = 'Activo' | 'Inactivo' | 'Finalizado' | 'Disponible' | 'Ocupado' | 'Fuera de servicio' | 'Pendiente' | 'Aprobada' | 'Rechazada';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena?: string;
  fechaCreacion?: string;
  activo: boolean;
}

export interface Administrador {
  idUsuario: number;
}

export interface Docente {
  idUsuario: number;
  numeroEmpleado: string;
  telefono?: string;
  departamento?: string;
  especializacion?: string;
  tipoContrato?: string;
  fechaContratacion?: string;
  horarioAtencion?: string;
  cubiculo?: string;
  usuario?: Usuario;
}

export interface Estudiante {
  idUsuario: number;
  matricula: string;
  telefono?: string;
  programa?: string;
  semestre?: string;
  fechaInscripcion?: string;
  direccion?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  grupos?: Array<{
    id: number;
    codigo: string;
    materia: string;
    docente: string;
    semestre: string;
    diaSemana?: string[];
    horaInicio?: string;
    horaFin?: string;
    cupoMax?: number;
    inscritos?: number;
    fechaInscripcion?: string;
  }>;
  usuario?: Usuario;
}

export interface Periodo {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: Extract<RegistroEstado, 'Activo' | 'Finalizado' | 'Inactivo'>;
}

export interface Materia {
  id: number;
  nombre: string;
  codigo: string;
  creditos: number;
  areaAcademica: string;
}

export interface Grupo {
  id: number;
  codigo?: string;
  nombre?: string;
  materia?: string;
  docente?: string;
  aulaId?: number | null;
  aula?: {
    id: number;
    edificio: string;
    numero: string;
    capacidad: number;
    estado: Extract<RegistroEstado, 'Disponible' | 'Ocupado' | 'Fuera de servicio'>;
  } | null;
  semestre: number | string;
  cupoMax: number;
  cupo_max?: number;
  inscritos?: number;
  idMateria?: number;
  idPeriodo?: number;
  diaSemana?: string[];
  horaInicio?: string;
  horaFin?: string;
  estudianteIds?: number[];
  estudiantes?: Array<{
    id: number;
    matricula: string;
    nombre: string;
    email: string;
    programa: string;
    semestre: string;
    fechaInscripcion?: string;
  }>;
}

export interface Aula {
  id: number;
  edificio: string;
  numero: string;
  capacidad: number;
  recursos: string[];
  estado: Extract<RegistroEstado, 'Disponible' | 'Ocupado' | 'Fuera de servicio'>;
}

export interface Horario {
  id: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  estado: Extract<RegistroEstado, 'Activo' | 'Inactivo'>;
  idAula: number;
  idDocente: number;
  idGrupo: number;
}

export interface Inscripcion {
  fechaInscripcion: string;
  idEstudiante: number;
  idGrupo: number;
}

export interface Solicitud {
  id: number;
  tipoSolicitud: string;
  aula: string;
  motivo: string;
  informacionAdicional: string;
  fechaSolicitud: string;
  estado: Extract<RegistroEstado, 'Pendiente' | 'Aprobada' | 'Rechazada'>;
  fechaResolucion?: string;
  docente?: {
    idUsuario: number;
    numeroEmpleado: string;
    nombreCompleto: string;
    correo: string;
  };
}

export interface TareaCurso {
  id: number;
  grupoId: number;
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
  creation?: string;
  grupo?: {
    id: number;
    codigo: string;
    materia: string;
    semestre: string;
  };
}

export type PeriodoCreate = Omit<Periodo, 'id'>;
export type PeriodoUpdate = Partial<PeriodoCreate>;

export type MateriaCreate = Omit<Materia, 'id'>;
export type MateriaUpdate = Partial<MateriaCreate>;

export type GrupoCreate = Omit<Grupo, 'id'>;
export type GrupoUpdate = Partial<GrupoCreate>;

export type AulaCreate = Omit<Aula, 'id'>;
export type AulaUpdate = Partial<AulaCreate>;

export type DocenteCreate = Omit<Docente, 'idUsuario'> & {
  usuario: Omit<Usuario, 'id' | 'fechaCreacion'>;
};
export type DocenteUpdate = Partial<DocenteCreate>;

export type EstudianteCreate = Omit<Estudiante, 'idUsuario'> & {
  usuario: Omit<Usuario, 'id' | 'fechaCreacion'>;
};
export type EstudianteUpdate = Partial<EstudianteCreate>;

export type HorarioCreate = Omit<Horario, 'id'>;
export type HorarioUpdate = Partial<HorarioCreate>;

export type SolicitudCreate = Omit<Solicitud, 'id' | 'fechaResolucion' | 'docente' | 'estado' | 'fechaSolicitud'>;
export type SolicitudUpdate = Partial<Omit<Solicitud, 'id'>>;

export type TareaCursoCreate = Omit<TareaCurso, 'id' | 'creation' | 'grupo'>;
export type TareaCursoUpdate = Partial<Omit<TareaCursoCreate, 'grupoId'>> & Partial<Pick<TareaCursoCreate, 'grupoId'>>;
