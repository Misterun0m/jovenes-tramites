import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

/* =========================
   MODELOS
========================= */
export interface User {
  user_id:          number;
  user_nom:         string;
  user_correo:      string;
  user_sex:         string | null;
  fecha_nacimiento: string | null;
  google_id:        string | null;
}

export interface ApiResponse {
  success: boolean | string;
  message: string;
  user?:   User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthBackendService {

  private API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /* =========================
     LOGIN NORMAL
  ========================= */
  loginNormal(correo: string, password: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.API_URL}/login_normal.php`,
      { correo, password }
    );
  }

  /* =========================
     LOGIN GOOGLE
  ========================= */
  loginWithGoogle(token: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.API_URL}/login.php`,
      { token }
    );
  }

  /* =========================
     ENVIAR CÓDIGO RECUPERACIÓN
  ========================= */
  enviarCodigo(correo: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/enviar_codigo.php`,
      { correo }
    );
  }

  /* =========================
     VERIFICAR CÓDIGO
  ========================= */
  verificarCodigo(correo: string, codigo: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/verificar_codigo.php`,
      { correo, codigo }
    );
  }

  /* =========================
     CAMBIAR PASSWORD
  ========================= */
  cambiarPassword(correo: string, password: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/cambiar_password.php`,
      { correo, password }
    );
  }
}