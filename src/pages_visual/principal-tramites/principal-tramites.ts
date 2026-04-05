import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TramitesService, TramiteUsuario } from '../../services/tramites.services';
import { ChatFlotanteComponent } from '../../components/chat_flotante/chat-flotante.componet';

const IMAGENES: Record<number, string> = {
  1: '/img/ine.png',
  2: '/img/rfc.png',
  3: '/img/nss.png',
  4: '/img/cartilla.png',
  5: '/img/licencia.png',
};

const PRIORIDADES: Record<number, string[]> = {
  1: ['Alta'],
  2: ['Media'],
  3: ['Alta'],
  4: ['Alta'],
  5: ['Baja'],
};

@Component({
  selector: 'app-principal-tramites',
  standalone: true,
  imports: [CommonModule, ChatFlotanteComponent],
  templateUrl: './principal-tramites.html',
  styleUrl: './principal-tramites.css',
})
export class PrincipalTramites implements OnInit {

  tramites: (TramiteUsuario & { img: string; prioridades: string[] })[] = [];
  cargando = true;
  error = '';
  filtroSeleccionado = 'Todos';
  menuAbierto = false;

  constructor(
    private router: Router,
    private tramitesService: TramitesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const datosSesion = localStorage.getItem('usuarioSesion');

    if (!datosSesion) {
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(datosSesion);

    this.tramitesService.getTramitesUsuario(user.user_id).subscribe({
      next: (res) => {
        if (res.success) {
          this.tramites = res.tramites.map(t => {
            let prioridades = [...(PRIORIDADES[t.tram_id] ?? ['Media'])];

            if (t.tram_id === 4) {
              prioridades = user.user_sex === 'Femenino' ? ['Baja'] : ['Alta'];
            }

            return {
              ...t,
              img: IMAGENES[t.tram_id] ?? '/img/default.png',
              prioridades,
            };
          });
        }
        this.cargando = false;
        this.cdr.detectChanges(); // ← fuerza actualización de la vista
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudieron cargar los trámites. Intenta de nuevo.';
        this.cargando = false;
        this.cdr.detectChanges(); // ← también en el error
      }
    });
  }

  // ─── CERRAR MENÚ AL CLIC FUERA ────────────────────────────────────────────
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.mi-dropdown')) {
      this.menuAbierto = false;
    }
  }

  // ─── FILTRO ───────────────────────────────────────────────────────────────
  get tramitesFiltrados() {
    if (this.filtroSeleccionado === 'Todos') return this.tramites;
    return this.tramites.filter(t => t.prioridades.includes(this.filtroSeleccionado));
  }

  setFiltro(tipo: string) {
    this.filtroSeleccionado = tipo;
  }

  // ─── NAVEGACIÓN ───────────────────────────────────────────────────────────
  verMasInformacion(tramite: TramiteUsuario) {
    localStorage.setItem('tramiteSeleccionado', JSON.stringify(tramite));
    this.router.navigate(['/detalle-tramites']);
  }

  irAAdministrar() {
    this.router.navigate(['/pantalla_usuario']);
  }

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
}
