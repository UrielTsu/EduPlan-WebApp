import { Routes } from '@angular/router';
import { HomeScreen } from './screens/home-screen/home-screen';
import { LoginScreen } from './screens/login-screen/login-screen';
import { DashboardAlumno} from './screens/dashboard-alumno/dashboard-alumno';
import { NavAlumno } from './partials/nav-alumno/nav-alumno';
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
]}
];
