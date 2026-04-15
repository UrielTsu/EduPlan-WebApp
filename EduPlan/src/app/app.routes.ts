import { Routes } from '@angular/router';
import { HomeScreen } from './screens/home-screen/home-screen';
import { LoginScreen } from './screens/login-screen/login-screen';
import { DashboardAlumno} from './screens/alumnos-screens/dashboard-alumno/dashboard-alumno';
import { NavAlumno } from './partials/nav-alumno/nav-alumno';
import { HorarioA } from './screens/alumnos-screens/horario-a-screen/horario-a-screen';
import { CursosA } from './screens/alumnos-screens/cursos-a/cursos-a';
import { AdminDashboard } from './screens/admin-screens/dashboard-admin/dashboard-admin';
import { CursosD } from './screens/alumnos-screens/cursos-d/cursos-d';
import { TareasA } from './screens/alumnos-screens/tareas-a/tareas-a';
import { TareasD } from './screens/alumnos-screens/tareas-d/tareas-d';
import { PerfilA } from './screens/alumnos-screens/perfil-a/perfil-a';
import { AulaComponent } from './screens/admin-screens/aula-admin/aula-admin';
import { SolicitudesAdminComponent } from './screens/admin-screens/solicitudes-admin/solicitudes-admin';
import { GestionAdminComponent } from './screens/admin-screens/gestion-admin/gestion-admin';
import { MaestroHome } from './screens/maestros-screens/dashboard-maestros/dashboard-maestros';
import { TeacherScheduleComponent } from './screens/maestros-screens/horario-m/horario-m';
import { SolicitudesM } from './screens/maestros-screens/solicitudes-m/solicitudes-m';
import { CursosM } from './screens/maestros-screens/cursos-m/cursos-m';
import { PerfilM } from './screens/maestros-screens/perfil-m/perfil-m';
import { authRoleGuard } from './guards/auth-role.guard';


export const routes: Routes = [
  { path: '', component: HomeScreen, pathMatch: 'full' },
  { path: 'login', component: LoginScreen, pathMatch: 'full' },

  {
    path: '',
    component: NavAlumno, // Este componente actúa como "cascarón"
    canActivateChild: [authRoleGuard],
    children: [
      {
        path: 'dashboard-alumno',
        component: DashboardAlumno,
        data: { roles: ['estudiante'] }
      },
      {
        path: 'horario-a',
        component: HorarioA,
        data: { roles: ['estudiante'] }
      },
      {
        path: 'cursos-a',
        component: CursosA,
        data: { roles: ['estudiante'] }
      },
      {
        path: 'admin',
        component: AdminDashboard,
        data: { roles: ['admin'] }
      },
      {
        path: 'admin/aulas',
        component: AulaComponent,
        data: { roles: ['admin'] }
      },
      {
        path: 'admin/solicitudes',
        component: SolicitudesAdminComponent,
        data: { roles: ['admin'] }
      },
      {
        path: 'admin/gestion',
        component: GestionAdminComponent,
        data: { roles: ['admin'] }
      }
      ,{
        path: 'cursos-d/:id',
        component: CursosD,
        data: { roles: ['estudiante'] }
      },
        {
        path : 'tareas',
        component : TareasA,
        data: { roles: ['estudiante'] }
      },
      {
        path : 'tareas-d/:id',
        component : TareasD,
        data: { roles: ['estudiante'] }
      },
      {
        path : 'perfil',
        component : PerfilA,
        data: { roles: ['estudiante'] }
      },
      {
        path : 'dashboard-maestros',
        component : MaestroHome,
        data: { roles: ['maestro'] }
      },
      {
        path : 'horario-m',
        component : TeacherScheduleComponent,
        data: { roles: ['maestro'] }
      },
      {
        path : 'profesor/solicitudes',
        component : SolicitudesM,
        data: { roles: ['maestro'] }
      },
      {
        path : 'cursos-m',
        component : CursosM,
        data: { roles: ['maestro'] }
      },
      {
        path : 'perfil-m',
        component : PerfilM,
        data: { roles: ['maestro'] }
      }

    ]
  }
];
