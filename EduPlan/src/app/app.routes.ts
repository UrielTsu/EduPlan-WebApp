import { Routes } from '@angular/router';
import { HomeScreen } from './screens/home-screen/home-screen';
import { LoginScreen } from './screens/login-screen/login-screen';
import { DashboardAlumno} from './screens/alumnos-screens/dashboard-alumno/dashboard-alumno';
import { NavAlumno } from './partials/nav-alumno/nav-alumno';
import { HorarioA } from './screens/alumnos-screens/horario-a-screen/horario-a-screen';
import { CursosA } from './screens/alumnos-screens/cursos-a/cursos-a';
import { AdminDashboard } from './screens/admin-screens/dashboard-admin/dashboard-admin';
import { CursosD } from './screens/alumnos-screens/cursos-d/cursos-d';

export const routes: Routes = [
  { path: '', component: HomeScreen, pathMatch: 'full' },
  { path: 'login', component: LoginScreen, pathMatch: 'full' },

  {
    path: '',
    component: NavAlumno, // Este componente actúa como "cascarón"
    children: [
      {
        path: 'dashboard-alumno',
        component: DashboardAlumno
      },
      {
        path: 'horario-a',
        component: HorarioA
      },
      {
        path: 'cursos-a',
        component: CursosA
      },
      {
        path: 'admin',
        component: AdminDashboard
      }
      ,{
        path: 'cursos-d',
        component: CursosD
      }
    ]
  }
];
