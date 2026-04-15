import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  token: string;
  role: string;
  roles: string[];
}

export interface CurrentUserResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  tipo_usuario: string;
  is_active: boolean;
  creation: string;
}

export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  creation: string;
}

export interface LogoutResponse {
  logout: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://127.0.0.1:8000';

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/api/auth/login/`, payload);
  }

  logout(): Observable<LogoutResponse> {
    const token = this.getToken();
    if (!token) {
      return of({ logout: true });
    }

    return this.http.get<LogoutResponse>(`${this.apiBaseUrl}/api/auth/logout/`, {
      headers: this.authHeaders(token)
    });
  }

  getCurrentUser(): Observable<CurrentUser> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No hay sesion activa.');
    }

    return this.http
      .get<CurrentUserResponse>(`${this.apiBaseUrl}/api/users/me/`, {
        headers: this.authHeaders(token)
      })
      .pipe(
        map((response) => this.mapCurrentUser(response)),
        tap((user) => this.persistCurrentUser(user))
      );
  }

  persistSession(response: LoginResponse): void {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('token', response.token);

    this.persistCurrentUser({
      id: response.id,
      firstName: response.first_name?.trim() ?? '',
      lastName: response.last_name?.trim() ?? '',
      fullName: `${response.first_name?.trim() ?? ''} ${response.last_name?.trim() ?? ''}`.trim() || response.email,
      email: response.email,
      role: this.normalizeRole(response.role),
      creation: ''
    });
  }

  clearSession(): void {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && localStorage.getItem('isAuthenticated') === 'true';
  }

  getStoredRole(): string {
    return localStorage.getItem('userRole') || '';
  }

  redirectPathForRole(role: string): string {
    if (role === 'admin') {
      return '/admin';
    }

    if (role === 'maestro') {
      return '/dashboard-maestros';
    }

    return '/dashboard-alumno';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private persistCurrentUser(user: CurrentUser): void {
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', user.fullName || user.email);
    localStorage.setItem('userRole', user.role);
  }

  private mapCurrentUser(response: CurrentUserResponse): CurrentUser {
    const firstName = response.first_name?.trim() ?? '';
    const lastName = response.last_name?.trim() ?? '';

    return {
      id: response.id,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim() || response.email,
      email: response.email,
      role: this.normalizeRole(response.tipo_usuario),
      creation: response.creation
    };
  }

  private normalizeRole(role: string): string {
    if (role === 'docente') {
      return 'maestro';
    }

    return role;
  }
}
