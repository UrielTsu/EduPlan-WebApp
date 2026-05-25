import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Aula,
  AulaCreate,
  AulaUpdate,
  Docente,
  DocenteCreate,
  DocenteUpdate,
  Estudiante,
  EstudianteCreate,
  EstudianteUpdate,
  Grupo,
  GrupoCreate,
  GrupoUpdate,
  Horario,
  HorarioCreate,
  HorarioUpdate,
  Inscripcion,
  Materia,
  MateriaCreate,
  MateriaUpdate,
  Periodo,
  PeriodoCreate,
  PeriodoUpdate,
  Solicitud,
  SolicitudCreate,
  SolicitudUpdate,
  TareaCurso,
  TareaCursoCreate,
  TareaCursoUpdate
} from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  // Cambia este valor por tu host real de API cuando ya tengas deploy.
  private readonly apiBaseUrl = 'https://eduplan-api-s2ir.onrender.com';

  private endpoint(path: string): string {
    return `${this.apiBaseUrl}${path}`;
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  private options() {
    return { headers: this.authHeaders() };
  }

  getPeriodos(): Observable<Periodo[]> {
    return this.http.get<Periodo[]>(this.endpoint('/api/periodos/'), this.options());
  }

  createPeriodo(payload: PeriodoCreate): Observable<Periodo> {
    return this.http.post<Periodo>(this.endpoint('/api/periodos/'), payload, this.options());
  }

  updatePeriodo(id: number, payload: PeriodoUpdate): Observable<Periodo> {
    return this.http.patch<Periodo>(this.endpoint(`/api/periodos/${id}/`), payload, this.options());
  }

  deletePeriodo(id: number): Observable<void> {
    return this.http.delete<void>(this.endpoint(`/api/periodos/${id}/`), this.options());
  }

  getMaterias(): Observable<Materia[]> {
    return this.http.get<Materia[]>(this.endpoint('/api/materias/'), this.options());
  }

  createMateria(payload: MateriaCreate): Observable<Materia> {
    return this.http.post<Materia>(this.endpoint('/api/materias/'), payload, this.options());
  }

  updateMateria(id: number, payload: MateriaUpdate): Observable<Materia> {
    return this.http.patch<Materia>(this.endpoint(`/api/materias/${id}/`), payload, this.options());
  }

  deleteMateria(id: number): Observable<void> {
    return this.http.delete<void>(this.endpoint(`/api/materias/${id}/`), this.options());
  }

  getGrupos(): Observable<Grupo[]> {
    return this.http.get<Grupo[]>(this.endpoint('/api/grupos/'), this.options());
  }

  createGrupo(payload: GrupoCreate): Observable<Grupo> {
    return this.http.post<Grupo>(this.endpoint('/api/grupos/'), payload, this.options());
  }

  updateGrupo(id: number, payload: GrupoUpdate): Observable<Grupo> {
    return this.http.patch<Grupo>(this.endpoint(`/api/grupos/${id}/`), payload, this.options());
  }

  deleteGrupo(id: number): Observable<void> {
    return this.http.delete<void>(this.endpoint(`/api/grupos/${id}/`), this.options());
  }

  getAulas(): Observable<Aula[]> {
    return this.http.get<Aula[]>(this.endpoint('/api/aulas/'), this.options());
  }

  createAula(payload: AulaCreate): Observable<Aula> {
    return this.http.post<Aula>(this.endpoint('/api/aulas/'), payload, this.options());
  }

  updateAula(id: number, payload: AulaUpdate): Observable<Aula> {
    return this.http.patch<Aula>(this.endpoint(`/api/aulas/${id}/`), payload, this.options());
  }

  deleteAula(id: number): Observable<void> {
    return this.http.delete<void>(this.endpoint(`/api/aulas/${id}/`), this.options());
  }

  getDocentes(): Observable<Docente[]> {
    return this.http.get<Docente[]>(this.endpoint('/api/docentes/'), this.options());
  }

  createDocente(payload: DocenteCreate): Observable<Docente> {
    return this.http.post<Docente>(this.endpoint('/api/docentes/'), payload, this.options());
  }

  updateDocente(idUsuario: number, payload: DocenteUpdate): Observable<Docente> {
    return this.http.patch<Docente>(this.endpoint(`/api/docentes/${idUsuario}/`), payload, this.options());
  }

  deleteDocente(idUsuario: number): Observable<void> {
    return this.http.delete<void>(this.endpoint(`/api/docentes/${idUsuario}/`), this.options());
  }

  getEstudiantes(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(this.endpoint('/api/estudiantes/'), this.options());
  }

  createEstudiante(payload: EstudianteCreate): Observable<Estudiante> {
    return this.http.post<Estudiante>(this.endpoint('/api/estudiantes/'), payload, this.options());
  }

  updateEstudiante(idUsuario: number, payload: EstudianteUpdate): Observable<Estudiante> {
    return this.http.patch<Estudiante>(this.endpoint(`/api/estudiantes/${idUsuario}/`), payload, this.options());
  }

  deleteEstudiante(idUsuario: number): Observable<void> {
    return this.http.delete<void>(this.endpoint(`/api/estudiantes/${idUsuario}/`), this.options());
  }

  getHorarios(): Observable<Horario[]> {
    return this.http.get<Horario[]>(this.endpoint('/admin/horarios/'), this.options());
  }

  createHorario(payload: HorarioCreate): Observable<Horario> {
    return this.http.post<Horario>(this.endpoint('/admin/horarios/'), payload, this.options());
  }

  updateHorario(id: number, payload: HorarioUpdate): Observable<Horario> {
    return this.http.patch<Horario>(this.endpoint(`/admin/horarios/${id}/`), payload, this.options());
  }

  deleteHorario(id: number): Observable<void> {
    return this.http.delete<void>(this.endpoint(`/admin/horarios/${id}/`), this.options());
  }

  getInscripciones(): Observable<Inscripcion[]> {
    return this.http.get<Inscripcion[]>(this.endpoint('/admin/inscripciones/'), this.options());
  }

  createInscripcion(payload: Inscripcion): Observable<Inscripcion> {
    return this.http.post<Inscripcion>(this.endpoint('/admin/inscripciones/'), payload, this.options());
  }

  deleteInscripcion(idEstudiante: number, idGrupo: number): Observable<void> {
    return this.http.delete<void>(
      this.endpoint(`/admin/inscripciones/${idEstudiante}/${idGrupo}/`),
      this.options()
    );
  }

  getSolicitudes(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(this.endpoint('/api/solicitudes/'), this.options());
  }

  createSolicitud(payload: SolicitudCreate): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.endpoint('/api/solicitudes/'), payload, this.options());
  }

  updateSolicitud(id: number, payload: SolicitudUpdate): Observable<Solicitud> {
    return this.http.patch<Solicitud>(this.endpoint(`/api/solicitudes/${id}/`), payload, this.options());
  }

  deleteSolicitud(id: number): Observable<void> {
    return this.http.delete<void>(this.endpoint(`/api/solicitudes/${id}/`), this.options());
  }

  getTareasCurso(grupoId?: number): Observable<TareaCurso[]> {
    const query = typeof grupoId === 'number' ? `?grupo_id=${grupoId}` : '';
    return this.http.get<TareaCurso[]>(this.endpoint(`/api/tareas/${query}`), this.options());
  }

  createTareaCurso(payload: TareaCursoCreate): Observable<TareaCurso> {
    return this.http.post<TareaCurso>(this.endpoint('/api/tareas/'), payload, this.options());
  }

  updateTareaCurso(id: number, payload: TareaCursoUpdate): Observable<TareaCurso> {
    return this.http.patch<TareaCurso>(this.endpoint(`/api/tareas/${id}/`), payload, this.options());
  }

  deleteTareaCurso(id: number): Observable<void> {
    return this.http.delete<void>(this.endpoint(`/api/tareas/${id}/`), this.options());
  }
}
