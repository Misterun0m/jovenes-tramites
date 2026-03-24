import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { ChatFlotanteComponent } from "../../components/chat_flotante/chat-flotante.componet";

@Component({
  selector: 'app-requisitos-tramites',
  standalone: true,
  imports: [CommonModule, ChatFlotanteComponent],
  templateUrl: './requisitos-tramites.html',
  styleUrl: './requisitos-tramites.css'
})
export class RequisitosTramites implements OnInit {

  requisitos: { nombre: string; completado: boolean }[] = [];
  portalOficial: string = '';
  tramite: any = null;
  cargando = true;
  intentoAvanzar = false; // ← nuevo: para mostrar el mensaje de advertencia

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tram_id']) {
        this.tramite = {
          tram_id:  +params['tram_id'],
          tram_tip:  params['tram_tip'] ?? ''
        };
      } else {
        const raw = localStorage.getItem('tramiteSeleccionado');
        if (!raw) { this.router.navigate(['/principal-tramites']); return; }
        this.tramite = JSON.parse(raw);
      }
      this.cargarRequisitos(this.tramite.tram_id);
    });
  }

  cargarRequisitos(tramId: number): void {
    this.usuarioService.getRequisitos(tramId).subscribe({
      next: (rows) => {
        if (rows && rows.length > 0) {
          const primera = rows[0];
          this.portalOficial = primera.portal_oficial ?? '';

          const texto: string = primera.descripcion ?? '';
          const items = texto
            .split('•')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 3);

          this.requisitos = items.map(nombre => ({ nombre, completado: false }));
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get todosCompletados(): boolean {
    return this.requisitos.length > 0 && this.requisitos.every(r => r.completado);
  }

  get progreso(): number {
    if (!this.requisitos.length) return 0;
    return Math.round((this.requisitos.filter(r => r.completado).length / this.requisitos.length) * 100);
  }

  get requisitosFaltantes(): number {
    return this.requisitos.filter(r => !r.completado).length;
  }

  toggleRequisito(index: number): void {
    this.requisitos[index].completado = !this.requisitos[index].completado;
    // Si ya completó todos, oculta el mensaje de advertencia automáticamente
    if (this.todosCompletados) {
      this.intentoAvanzar = false;
    }
    this.cdr.detectChanges();
  }

  abrirPortal(): void {
    if (this.portalOficial) window.open(this.portalOficial, '_blank');
  }

  irAtras(): void {
    this.router.navigate(['/detalle-tramites'], {
      queryParams: {
        tram_id:  this.tramite.tram_id,
        tram_tip: this.tramite.tram_tip
      }
    });
  }

  irSiguiente(): void {
    // ← Bloquea si no están todos completados
    if (!this.todosCompletados) {
      this.intentoAvanzar = true;
      this.cdr.detectChanges();
      return;
    }

    this.router.navigate(['/mapa-tramites'], {
      queryParams: {
        tram_id:  this.tramite.tram_id,
        tram_tip: this.tramite.tram_tip
      }
    });
  }
}