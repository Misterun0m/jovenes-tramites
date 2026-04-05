import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TramiteService {

  private apiUrl = 'http://localhost/backend/tramite.php'; // Cambia a tu ruta real del PHP

  constructor(private http: HttpClient) {}

  obtenerTramitesUsuario(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?action=obtenerUsuario&user_id=${userId}`);
  }

  actualizarEstado(userTramiteId: number, nuevoEstado: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}?action=actualizarEstado&user_idtramite=${userTramiteId}`, {
      estado_tramite: nuevoEstado
    });
  }
}