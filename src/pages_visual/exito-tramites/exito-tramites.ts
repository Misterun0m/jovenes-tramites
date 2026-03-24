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

  tramId       = 0;
  tramiteLabel = '';
  moduloId     = 0;
  moduloNombre = '';
  portalOficial: string = '';  // ← URL desde la BD

  constructor(
    private router: Router,
    private route:  ActivatedRoute,
    private usuarioService: UsuarioService,  // ← inyectado
    private cdr: ChangeDetectorRef           // ← inyectado
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tramId       = +params['tram_id']  || 0;
      this.tramiteLabel =  params['tram_tip'] ?? '';
      this.moduloId     = +params['modulo_id'] || 0;
      this.moduloNombre =  params['nombre']   ?? '';

      if (this.tramId) {
        this.cargarPortal(this.tramId);  // ← carga la URL
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
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }

  irAlPortal(): void {
    if (this.portalOficial) {
      window.open(this.portalOficial, '_blank');
    }
  }

  irAlInicio(): void {
    this.router.navigate(['/principal-tramites']);
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