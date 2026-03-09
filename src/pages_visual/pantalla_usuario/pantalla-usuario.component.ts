// pantalla-usuario.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../services/usuario.service';
import { ChatFlotanteComponent } from "../../components/chat_flotante/chat-flotante.componet";


@Component({
  selector: 'app-pantalla-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ChatFlotanteComponent],
  templateUrl: './pantalla_usuario.html',
  styleUrls: ['./pantalla-usuario.css']
})
export class PantallaUsuarioComponent implements OnInit {

  usuario: any = {};
  usuarioEdit: any = {};
  tramites: any[] = [];
  editing: boolean = false;
  vistaActual: 'tramites' | 'perfil' = 'tramites';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) { this.router.navigate(['/login']); return; }

    const userObj = JSON.parse(userRaw);
    const userId  = Number(userObj.user_id);
    if (!userId)  { this.router.navigate(['/login']); return; }

    this.cargarUsuario(userId);
    this.cargarTramites(userId);
  }

  // ── Getters ───────────────────────────────────────────────────────────────────

  get tramitesFinalizados(): number {
    return this.tramites.filter(t => t.estado_tramite === 'Finalizado').length;
  }

  getTramiteIcon(tipo: string): string {
    const map: Record<string, string> = {
      'INE': '🪪', 'elector': '🪪',
      'RFC': '📊', 'contribuyente': '📊',
      'NSS': '🏥', 'seguro': '🏥',
      'cartilla': '🎖️', 'militar': '🎖️',
      'licencia': '🚗', 'conducir': '🚗',
      'pasaporte': '📕',
    };
    const key = Object.keys(map).find(k => tipo?.toLowerCase().includes(k.toLowerCase()));
    return key ? map[key] : '📋';
  }

  getBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      'Pendiente':  'tc-badge badge-pendiente',
      'En proceso': 'tc-badge badge-en-proceso',
      'Finalizado': 'tc-badge badge-finalizado',
    };
    return map[estado] ?? 'tc-badge badge-pendiente';
  }

  // ── Carga de datos ────────────────────────────────────────────────────────────

  cargarUsuario(userId: number) {
    this.usuarioService.getUsuario(userId).subscribe({
      next: res => {
        this.usuario     = res;
        this.usuarioEdit = { ...res };
        this.cdr.detectChanges();
      },
      error: () => Swal.fire('Error', 'No se pudo obtener la información del usuario', 'error')
    });
  }

  cargarTramites(userId: number) {
    this.usuarioService.getTramitesUsuario(userId).subscribe({
      next: res => { this.tramites = res; this.cdr.detectChanges(); },
      error: () => Swal.fire('Error', 'No se pudieron cargar los trámites', 'error')
    });
  }

  // ── Edición de perfil ─────────────────────────────────────────────────────────

  abrirEdicion(): void {
    this.usuarioEdit = { ...this.usuario };
    this.editing     = true;
    this.vistaActual = 'perfil';
  }

  cancelarEdicion(): void {
    this.usuarioEdit = { ...this.usuario };
    this.editing     = false;
  }

  guardarCambios(): void {
    if (!this.usuarioEdit.user_nom?.trim()) {
      Swal.fire('Campo requerido', 'El nombre no puede estar vacío', 'warning');
      return;
    }

    Swal.fire({
      title: '¿Guardar cambios?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#7c3aed',
    }).then(result => {
      if (result.isConfirmed) {
        const userRaw = localStorage.getItem('user');
        const userId  = userRaw ? Number(JSON.parse(userRaw).user_id) : 0;

        this.usuarioService.updateUsuario(userId, this.usuarioEdit).subscribe({
          next: () => {
            // Recargar datos frescos del servidor → actualiza sidebar y perfil
            this.cargarUsuario(userId);
            this.editing = false;
            this.cdr.detectChanges();
            Swal.fire('¡Listo!', 'Datos actualizados correctamente', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudieron actualizar los datos', 'error')
        });
      }
    });
  }

  // ── Trámites ──────────────────────────────────────────────────────────────────

  cambiarEstado(tramite: any, nuevoEstado: string): void {
    Swal.fire({
      title: '¿Cambiar estado?',
      text: `Se actualizará a "${nuevoEstado}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#7c3aed',
    }).then(result => {
      if (result.isConfirmed) {
        this.usuarioService.updateEstadoTramite(tramite.user_idtramite, nuevoEstado).subscribe({
          next: () => {
            tramite.estado_tramite = nuevoEstado;
            this.cdr.detectChanges();
            Swal.fire('¡Listo!', 'Estado actualizado', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo actualizar el estado', 'error')
        });
      } else {
        const userId = Number(JSON.parse(localStorage.getItem('user')!).user_id);
        this.cargarTramites(userId);
      }
    });
  }

  // ── Navegación ────────────────────────────────────────────────────────────────

  irTutorial(): void { this.router.navigate(['/tutorial-tramite']); }

  cerrarSesion(): void {
    Swal.fire({
      title: '¿Cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    }).then(result => {
      if (result.isConfirmed) {
        this.usuarioService.logout().subscribe({
          next: () => { localStorage.clear(); this.router.navigate(['/login']); },
          error: () => Swal.fire('Error', 'No se pudo cerrar sesión', 'error')
        });
      }
    });
  }
}
