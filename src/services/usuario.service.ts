import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private registroUrl = 'http://localhost/backend/registro.php';
  private usuarioUrl  = 'http://localhost/backend/usuario.php';

  constructor(private http: HttpClient) {}

  // ── Registro ──────────────────────────────────────────
  registrar(data: any): Observable<any> {
    return this.http.post(this.registroUrl, data, { withCredentials: true });
  }

  // ── Recuperación de contraseña ────────────────────────
  enviarCodigo(correo: string): Observable<any> {
    return this.http.post('http://localhost/backend/enviar_codigo.php', { correo });
  }

  // ── Perfil de usuario ─────────────────────────────────
  getUsuario(userId: number): Observable<any> {
    return this.http.get<any>(`${this.usuarioUrl}?action=obtener&user_id=${userId}`, { withCredentials: true });
  }

  updateUsuario(userId: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.usuarioUrl}?action=actualizar&user_id=${userId}`, data, { withCredentials: true });
  }

  // ── Cambio de contraseña ──────────────────────────────
  cambiarPassword(userId: number, passwordActual: string, passwordNueva: string): Observable<any> {
    return this.http.post<any>(
      `${this.usuarioUrl}?action=cambiar_password&user_id=${userId}`,
      { password_actual: passwordActual, password_nueva: passwordNueva },
      { withCredentials: true }
    );
  }

  // ── Trámites del usuario ──────────────────────────────
  getTramitesUsuario(userId: number): Observable<any> {
    return this.http.get<any>(`${this.usuarioUrl}?action=tramites&user_id=${userId}`, { withCredentials: true });
  }

  updateEstadoTramite(user_idtramite: number, estado_tramite: string): Observable<any> {
    return this.http.post<any>(`${this.usuarioUrl}?action=actualizar_estado`, { user_idtramite, estado_tramite }, { withCredentials: true });
  }

  // ── Requisitos de un trámite ──────────────────────────
  getRequisitos(tramId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.usuarioUrl}?action=requisitos&tram_id=${tramId}`, { withCredentials: true });
  }

  // ── Eliminar cuenta ───────────────────────────────────
  eliminarCuenta(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.usuarioUrl}?action=eliminar&user_id=${userId}`, { withCredentials: true });
  }

  // ── Logout ────────────────────────────────────────────
  logout(): Observable<any> {
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }
}