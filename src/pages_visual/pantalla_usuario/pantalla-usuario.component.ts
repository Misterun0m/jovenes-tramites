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

  usuario:     any = {};
  usuarioEdit: any = {};
  tramites:    any[] = [];
  editing:     boolean = false;
  vistaActual: 'tramites' | 'perfil' = 'tramites';

  // ── Cambio de contraseña ──────────────────────────────────────
  showPasswordSection: boolean = false;
  passwordData = { actual: '', nueva: '', confirmar: '' };
  showPassActual:    boolean = false;
  showPassNueva:     boolean = false;
  showPassConfirmar: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private router:         Router,
    private cdr:            ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userRaw = localStorage.getItem('usuarioSesion');
    if (!userRaw) { this.router.navigate(['/login']); return; }

    const userObj = JSON.parse(userRaw);
    const userId  = Number(userObj.user_id);
    if (!userId)  { this.router.navigate(['/login']); return; }

    this.cargarUsuario(userId);
    this.cargarTramites(userId);
  }

  // ── Getters ───────────────────────────────────────────────────

  /**
   * Detecta si el usuario inició sesión con Google.
   * Verifica tanto el objeto cargado desde la API como el localStorage,
   * para que funcione correctamente incluso antes de que llegue la respuesta.
   */
  get esUsuarioGoogle(): boolean {
    if (!!this.usuario.google_id) return true;
    try {
      const raw = localStorage.getItem('usuarioSesion');
      if (!raw) return false;
      const obj = JSON.parse(raw);
      return !!obj.google_id;
    } catch {
      return false;
    }
  }
  get tramitesFinalizados(): number {
    return this.tramites.filter(t => t.estado_tramite === 'Finalizado').length;
  }

  getTramiteIcon(tipo: string): string {
    const map: Record<string, string> = {
      'ine':           '/img/ine.png',
      'elector':       '/img/ine.png',
      'rfc':           '/img/rfc.png',
      'contribuyente': '/img/rfc.png',
      'nss':           '/img/nss.png',
      'seguro':        '/img/nss.png',
      'cartilla':      '/img/cartilla.png',
      'militar':       '/img/cartilla.png',
      'licencia':      '/img/licencia.png',
      'conducir':      '/img/licencia.png',
      'pasaporte':     '/img/pasaporte.png',
    };
    const key = Object.keys(map).find(k => tipo?.toLowerCase().includes(k));
    return key ? map[key] : '/img/default.png';
  }

  getBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      'Pendiente':  'tc-badge badge-pendiente',
      'En proceso': 'tc-badge badge-en-proceso',
      'Finalizado': 'tc-badge badge-finalizado',
    };
    return map[estado] ?? 'tc-badge badge-pendiente';
  }

  // ── Carga de datos ────────────────────────────────────────────

  cargarUsuario(userId: number) {
    this.usuarioService.getUsuario(userId).subscribe({
      next: res => {
        this.usuario = res;
        if (!this.editing) {
          this.usuarioEdit = { ...res };
        }
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

  // ── Navegación ────────────────────────────────────────────────

  irPerfil(): void {
    this.usuarioEdit         = { ...this.usuario };
    this.editing             = false;
    this.vistaActual         = 'perfil';
    this.showPasswordSection = false;
    this.passwordData        = { actual: '', nueva: '', confirmar: '' };
    this.cdr.detectChanges();
  }

  irTutorial(): void { this.router.navigate(['/principal-tramites']); }

cerrarSesion() {
  Swal.fire({
    title: '¿Cerrar sesión?',
    text: 'Tendrás que volver a ingresar tu correo y contraseña.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#9333EA',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      const userRaw = localStorage.getItem('usuarioSesion');
      if (userRaw) {
        try {
          const parsed = JSON.parse(userRaw);
          localStorage.removeItem(`tramitebot_chat_${parsed.user_id}`);
        } catch {}
      }
      localStorage.removeItem('usuarioSesion');
      localStorage.removeItem('tramiteSeleccionado');
      this.router.navigate(['/login']);
    }
  });
}
  // ── Edición de perfil ─────────────────────────────────────────

  abrirEdicion(): void {
    this.usuarioEdit         = { ...this.usuario };
    this.editing             = true;
    this.vistaActual         = 'perfil';
    this.showPasswordSection = false;
    this.passwordData        = { actual: '', nueva: '', confirmar: '' };
    this.cdr.detectChanges();
  }

  cancelarEdicion(): void {
    this.usuarioEdit         = { ...this.usuario };
    this.editing             = false;
    this.showPasswordSection = false;
    this.passwordData        = { actual: '', nueva: '', confirmar: '' };
    this.cdr.detectChanges();
  }

  guardarCambios(): void {
    const nombreLimpio = this.usuarioEdit.user_nom?.trim() ?? '';

    if (!nombreLimpio) {
      Swal.fire('Campo requerido', 'El nombre no puede estar vacío.', 'warning');
      return;
    }

    if (this.usuarioEdit.user_nom !== nombreLimpio) {
      Swal.fire('Nombre inválido', 'El nombre no debe tener espacios al inicio o al final.', 'error');
      return;
    }

    if (!this.usuarioEdit.user_sex) {
      Swal.fire('Campo requerido', 'Debes seleccionar tu sexo biológico.', 'warning');
      return;
    }

    if (!this.usuarioEdit.fecha_nacimiento) {
      Swal.fire('Campo requerido', 'Debes ingresar tu fecha de nacimiento.', 'warning');
      return;
    }

    // Validar correo solo si no es usuario Google (Google lo tiene bloqueado)
    if (!this.esUsuarioGoogle) {
      const correoLimpio = this.usuarioEdit.user_correo?.trim() ?? '';
      if (!correoLimpio) {
        Swal.fire('Campo requerido', 'El correo no puede estar vacío.', 'warning');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correoLimpio)) {
        Swal.fire('Correo inválido', 'Ingresa un correo electrónico válido.', 'error');
        return;
      }
      this.usuarioEdit.user_correo = correoLimpio;
    }

    Swal.fire({
      title: '¿Guardar cambios?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#7c3aed',
    }).then(result => {
      if (!result.isConfirmed) return;

      const userRaw = localStorage.getItem('usuarioSesion');
      const userId  = userRaw ? Number(JSON.parse(userRaw).user_id) : 0;

      this.usuarioService.updateUsuario(userId, this.usuarioEdit).subscribe({
        next: () => {
          this.cargarUsuario(userId);
          this.editing = false;
          this.cdr.detectChanges();
          Swal.fire('¡Listo!', 'Datos actualizados correctamente.', 'success');
        },
        error: () => Swal.fire('Error', 'No se pudieron actualizar los datos.', 'error')
      });
    });
  }

  // ── Cambio de contraseña ──────────────────────────────────────

  getPasswordStrength(): number {
    const p = this.passwordData.nueva;
    if (!p || p.length < 4) return 0;
    let score = 0;
    if (p.length >= 8)                             score++;
    if (/[A-Z]/.test(p) && /[0-9]/.test(p))       score++;
    if (p.length >= 12 && /[^A-Za-z0-9]/.test(p)) score++;
    return Math.max(score, 1);
  }

  cambiarPassword(): void {
    // ── Bloquear si es usuario Google ────────────────────────────
    if (this.esUsuarioGoogle) {
      Swal.fire({
        icon: 'info',
        title: 'Cuenta de Google',
        text: 'Tu cuenta está vinculada a Google. No puedes establecer una contraseña local desde aquí.',
        confirmButtonColor: '#7c3aed',
      });
      return;
    }

    const { actual, nueva, confirmar } = this.passwordData;

    if (!actual || !nueva || !confirmar) {
      Swal.fire('Campos requeridos', 'Completa todos los campos de contraseña.', 'warning');
      return;
    }
    if (actual !== actual.trim()) {
      Swal.fire('Contraseña inválida', 'La contraseña actual no debe tener espacios al inicio o al final.', 'error');
      return;
    }
    if (nueva !== nueva.trim()) {
      Swal.fire('Contraseña inválida', 'La nueva contraseña no debe tener espacios al inicio o al final.', 'error');
      return;
    }
    if (/\s{2,}/.test(nueva)) {
      Swal.fire('Contraseña inválida', 'La nueva contraseña no debe tener espacios consecutivos.', 'error');
      return;
    }
    if (!nueva.trim()) {
      Swal.fire('Contraseña vacía', 'La contraseña no puede estar compuesta solo de espacios.', 'warning');
      return;
    }
    if (nueva.length < 8) {
      Swal.fire('Contraseña muy corta', 'La nueva contraseña debe tener al menos 8 caracteres.', 'warning');
      return;
    }
    if (!/[A-Z]/.test(nueva)) {
      Swal.fire('Contraseña débil', 'La nueva contraseña debe tener al menos una letra mayúscula.', 'warning');
      return;
    }
    if (!/[0-9]/.test(nueva)) {
      Swal.fire('Contraseña débil', 'La nueva contraseña debe contener al menos un número.', 'warning');
      return;
    }
    if (nueva !== confirmar) {
      Swal.fire('No coinciden', 'La nueva contraseña y su confirmación no son iguales.', 'error');
      return;
    }
    if (actual === nueva) {
      Swal.fire('Sin cambios', 'La nueva contraseña debe ser diferente a la actual.', 'warning');
      return;
    }

    Swal.fire({
      title: '¿Cambiar contraseña?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#7c3aed',
    }).then(result => {
      if (!result.isConfirmed) return;

      const userRaw = localStorage.getItem('usuarioSesion');
      const userId  = userRaw ? Number(JSON.parse(userRaw).user_id) : 0;

      this.usuarioService.cambiarPassword(userId, actual, nueva).subscribe({
        next: (res: any) => {
          if (res.success) {
            Swal.fire({
              icon: 'success',
              title: '¡Contraseña actualizada!',
              text: 'Tu contraseña ha sido cambiada correctamente.',
              confirmButtonColor: '#7c3aed',
            });
            this.passwordData        = { actual: '', nueva: '', confirmar: '' };
            this.showPasswordSection = false;
          } else {
            Swal.fire('Error', res.message || 'No se pudo cambiar la contraseña.', 'error');
          }
        },
        error: (err) => {
          const msg = err.status === 401
            ? 'La contraseña actual es incorrecta.'
            : 'Error al cambiar la contraseña. Intenta de nuevo.';
          Swal.fire('Error', msg, 'error');
        }
      });
    });
  }

  // ── Trámites ──────────────────────────────────────────────────

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
            Swal.fire('¡Listo!', 'Estado actualizado.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo actualizar el estado.', 'error')
        });
      } else {
        const userId = Number(JSON.parse(localStorage.getItem('usuarioSesion')!).user_id);
        this.cargarTramites(userId);
      }
    });
  }

  // ── Eliminar cuenta ───────────────────────────────────────────

  eliminarCuenta(): void {
    Swal.fire({
      title: '¿Eliminar cuenta?',
      html: `
        <p style="color:#6b7280;margin-bottom:8px">Esta acción es <b style="color:#ef4444">permanente e irreversible</b>.</p>
        <p style="color:#6b7280">Se eliminarán tu cuenta y todos tus trámites registrados.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar mi cuenta',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
    }).then(result => {
      if (result.isConfirmed) {
        const userId = Number(JSON.parse(localStorage.getItem('usuarioSesion')!).user_id);
        this.usuarioService.eliminarCuenta(userId).subscribe({
          next: () => {
            localStorage.clear();
            Swal.fire({
              title: 'Cuenta eliminada',
              text: 'Tu cuenta ha sido eliminada correctamente.',
              icon: 'success',
              confirmButtonColor: '#7c3aed',
            }).then(() => this.router.navigate(['/login']));
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar la cuenta. Intenta de nuevo.', 'error')
        });
      }
    });
  }

}