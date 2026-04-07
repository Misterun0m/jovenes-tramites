import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { ChatFlotanteComponent } from "../../components/chat_flotante/chat-flotante.componet";

@Component({
  selector: 'app-exito-tramites',
  standalone: true,
  imports: [CommonModule, ChatFlotanteComponent],
  templateUrl: './exito-tramites.html',
  styleUrl: './exito-tramites.css'
})
export class ExitoTramites implements OnInit {

  tramId          = 0;
  tramiteLabel    = '';
  moduloId        = 0;
  moduloNombre    = '';
  portalOficial   = '';
  userIdtramite   = 0;  // ← ID del registro en user_tramite

  // ── Modal ──────────────────────────────────────────────
  mostrarModal      = false;
  estadoSeleccionado: string | null = null;
  accionPendiente: 'portal' | 'inicio' | null = null;

  estadoOpciones = [
    { valor: 'Pendiente',   label: 'Pendiente',    clase: 'dot-pendiente'  },
    { valor: 'En progreso', label: 'En progreso',  clase: 'dot-progreso'   },
    { valor: 'Finalizado',  label: 'Finalizado',   clase: 'dot-finalizado' },
  ];

  constructor(
    private router: Router,
    private route:  ActivatedRoute,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tramId         = +params['tram_id']         || 0;
      this.tramiteLabel   =  params['tram_tip']        ?? '';
      this.moduloId       = +params['modulo_id']       || 0;
      this.moduloNombre   =  params['nombre']          ?? '';
      this.userIdtramite  = +params['user_idtramite']  || 0;

      if (this.tramId) {
        this.cargarPortal(this.tramId);
      }
    });
  }

  cargarPortal(tramId: number): void {
    this.usuarioService.getRequisitos(tramId).subscribe({
      next: (rows) => {
        if (rows && rows.length > 0) {
          this.portalOficial = rows[0].portal_oficial ?? '';
        }
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  // ── Modal: abrir ───────────────────────────────────────
  abrirModalEstado(accion: 'portal' | 'inicio'): void {
    this.accionPendiente    = accion;
    this.estadoSeleccionado = null;
    this.mostrarModal       = true;
  }

  cerrarModal(): void {
    this.mostrarModal    = false;
    this.accionPendiente = null;
  }

  seleccionarEstado(valor: string): void {
    this.estadoSeleccionado = valor;
  }

  // ── Modal: confirmar con cambio de estado ──────────────
  confirmarEstado(): void {
    if (!this.estadoSeleccionado) return;

    if (this.userIdtramite) {
      this.usuarioService.updateEstadoTramite(
        this.userIdtramite,
        this.estadoSeleccionado
      ).subscribe({
        next:  () => this.ejecutarAccion(),
        error: () => this.ejecutarAccion()   // continúa aunque falle
      });
    } else {
      this.ejecutarAccion();
    }
  }

  // ── Modal: omitir sin cambiar estado ──────────────────
  continuarSinCambiar(): void {
    this.mostrarModal = false;
    this.ejecutarAccion();
  }

  // ── Ejecuta la navegación pendiente ───────────────────
  private ejecutarAccion(): void {
    this.mostrarModal = false;
    if (this.accionPendiente === 'portal') {
      if (this.portalOficial) window.open(this.portalOficial, '_blank');
    } else {
      this.router.navigate(['/principal-tramites']);
    }
    this.accionPendiente = null;
  }

  irAtras(): void {
    this.router.navigate(['/mapa-tramites'], {
      queryParams: {
        tram_id:  this.tramId,
        tram_tip: this.tramiteLabel
      }
    });
  }
}