export type RegistroEstado = 'Activo' | 'Inactivo' | 'Finalizado' | 'Disponible' | 'En uso' | 'Pendiente' | 'Aprobada' | 'Rechazada';

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
  usuario?: Usuario;
}

export interface Estudiante {
  idUsuario: number;
  matricula: string;
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
  nombre: string;
  semestre: number;
  cupoMax: number;
  idMateria: number;
  idPeriodo: number;
}

export interface Aula {
  id: number;
  edificio: string;
  numero: string;
  capacidad: number;
  recursos: string[];
  estado: Extract<RegistroEstado, 'Disponible' | 'En uso' | 'Inactivo'>;
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
  idDocente: number;
  idGrupo: number;
  fechaPropuesta: string;
  motivo: string;
  estado: Extract<RegistroEstado, 'Pendiente' | 'Aprobada' | 'Rechazada'>;
  fechaResolucion?: string;
  idAdminResuelve?: number;
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

export type SolicitudCreate = Omit<Solicitud, 'id' | 'fechaResolucion' | 'idAdminResuelve'>;
export type SolicitudUpdate = Partial<Omit<Solicitud, 'id'>>;
