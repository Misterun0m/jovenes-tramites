import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Tramite {
  tram_id:    number;
  tram_tip:   string;
  tram_imp:   string;
  tram_saber: string;
  requisito?: Requisito | null;
}

export interface Requisito {
  re_id:          number;
  descripcion:    string;
  portal_oficial: string;
}

export interface Usuario {
  user_id:           number;
  user_nom:          string;
  user_sex?:         string;
  user_correo:       string;
  fecha_nacimiento?: string;
}

export interface UserTramite {
  user_idtramite:     number;
  estado_tramite:     'Pendiente' | 'En proceso' | 'Finalizado';
  fecha_inicio:       string;
  fecha_finalizacion: string | null;
  tramite:            Tramite;
  requisito:          Requisito | null;
}

export interface Modulo {
  modulo_id:     number;
  nombre:        string;
  direccion:     string;
  lat:           number;
  lng:           number;
  horario:       string;
  telefono?:     string | null;
  url_cita?:     string | null;
  distancia_km?: number | null;
}

export interface ModulosResponse {
  tramite: { tram_id: number; tram_tip: string };
  total:   number;
  modulos: Modulo[];
}

interface ApiOk<T> { ok: true;  data: T }
interface ApiError  { ok: false; message: string }
type ApiResp<T> = ApiOk<T> | ApiError;

@Injectable({ providedIn: 'root' })
export class TramitesService {

  private readonly BASE = 'https://backend-production-5b65.up.railway.app';

  constructor(private http: HttpClient) {}

  // ── Trámites ──────────────────────────────────────────────

  getTramites(): Observable<Tramite[]> {
    return this.http.get<ApiResp<Tramite[]>>(`${this.BASE}/tramites.php`).pipe(
      map(r => this.unwrap(r)),
      catchError(this.handleError)
    );
  }

  // ── Trámites del usuario ──────────────────────────────────

  getUserTramites(userId: number): Observable<UserTramite[]> {
    const params = new HttpParams().set('user_id', userId);
    return this.http.get<ApiResp<UserTramite[]>>(
      `${this.BASE}/user_tramites.php`, { params }
    ).pipe(
      map(r => this.unwrap(r)),
      catchError(this.handleError)
    );
  }

  registrarTramite(userId: number, tramId: number): Observable<{ user_idtramite: number }> {
    return this.http.post<ApiResp<{ user_idtramite: number }>>(
      `${this.BASE}/user_tramites.php`,
      { user_id: userId, tram_id: tramId }
    ).pipe(
      map(r => this.unwrap(r)),
      catchError(this.handleError)
    );
  }

  actualizarEstado(
    userIdTramite: number,
    estado: 'Pendiente' | 'En proceso' | 'Finalizado'
  ): Observable<{ updated: number; estado_tramite: string }> {
    return this.http.patch<ApiResp<{ updated: number; estado_tramite: string }>>(
      `${this.BASE}/user_tramites.php`,
      { user_idtramite: userIdTramite, estado_tramite: estado }
    ).pipe(
      map(r => this.unwrap(r)),
      catchError(this.handleError)
    );
  }

  // ── Módulos ───────────────────────────────────────────────

  getModulos(tramId: number, lat?: number, lng?: number): Observable<ModulosResponse> {
    let params = new HttpParams().set('tipo', tramId);
    if (lat != null && lng != null) {
      params = params.set('lat', lat).set('lng', lng);
    }
    return this.http.get<ApiResp<ModulosResponse>>(
      `${this.BASE}/Modulo.php`, { params }  // ← M mayúscula, igual que tu archivo
    ).pipe(
      map(r => this.unwrap(r)),
      catchError(this.handleError)
    );
  }

  // ── Helpers ───────────────────────────────────────────────

  private unwrap<T>(resp: ApiResp<T>): T {
    if (!resp.ok) throw new Error((resp as ApiError).message);
    return (resp as ApiOk<T>).data;
  }

  private handleError(err: any): Observable<never> {
    let msg = 'Error desconocido.';
    if (err instanceof Error) {
      msg = err.message;
    } else if (err.status === 0) {
      msg = 'No se puede conectar con el servidor PHP.';
    } else if (err.error?.message) {
      msg = err.error.message;
    }
    console.error('[TramitesService]', msg, err);
    return throwError(() => new Error(msg));
  }
}
