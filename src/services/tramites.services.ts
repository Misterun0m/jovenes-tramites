import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TramiteUsuario {
  user_idtramite: number;
  tram_id: number;
  nombre: string;
  descripcion: string;
  info_util: string;
  estado_tramite: 'Pendiente' | 'Finalizado';
  fecha_inicio: string;
  fecha_finalizacion: string | null;
}

export interface TramitesResponse {
  success: boolean;
  user_id: number;
  tramites: TramiteUsuario[];
}

@Injectable({ providedIn: 'root' })
export class TramitesService {

  private apiUrl = 'http://localhost/backend/get_tramites_usuario.php';

  constructor(private http: HttpClient) {}

  getTramitesUsuario(userId: number): Observable<TramitesResponse> {
    return this.http.get<TramitesResponse>(`${this.apiUrl}?user_id=${userId}`);
  }
}
