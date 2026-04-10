import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatFlotanteComponent } from "../../components/chat_flotante/chat-flotante.componet";

@Component({
  selector: 'app-detalle-tramite',
  standalone: true,
  imports: [CommonModule, ChatFlotanteComponent],
  templateUrl: './detalle-tramites.html',
  styleUrl: './detalle-tramites.css'
})
export class DetalleTramite implements OnInit {

  tramite: any = null;

  // ── Explicación de importancia por trámite ──────────────────────────────
private importancias: Record<string, string> = {
  'ine':           'Sin INE puedes ser detenido si no puedes identificarte. No podrás votar, abrir cuentas, firmar contratos ni acceder a apoyos del gobierno. Legalmente existes, pero el sistema no te reconoce.',
  'elector':       'Sin INE puedes ser detenido si no puedes identificarte. No podrás votar, abrir cuentas, firmar contratos ni acceder a apoyos del gobierno. Legalmente existes, pero el sistema no te reconoce.',
  'rfc':           'Trabajar sin RFC te deja en la informalidad: sin contrato, sin IMSS, sin aguinaldo y sin derechos laborales. Además, emitir facturas sin RFC es una infracción fiscal que puede derivar en multas del SAT.',
  'contribuyente': 'Trabajar sin RFC te deja en la informalidad: sin contrato, sin IMSS, sin aguinaldo y sin derechos laborales. Además, emitir facturas sin RFC es una infracción fiscal que puede derivar en multas del SAT.',
  'nss':           'Sin NSS no puedes acceder al IMSS. Cualquier accidente o enfermedad te costará de tu bolsillo. Tampoco acumulas semanas para tu pensión, lo que afecta directamente tu retiro décadas después.',
  'seguro':        'Sin NSS no puedes acceder al IMSS. Cualquier accidente o enfermedad te costará de tu bolsillo. Tampoco acumulas semanas para tu pensión, lo que afecta directamente tu retiro décadas después.',
  'cartilla':      'No tramitarla antes de los 40 años puede resultar en arresto de 15 a 45 días o multa. Quedas bloqueado para empleos en gobierno, fuerzas armadas y para obtener pasaporte.',
  'militar':       'No tramitarla antes de los 40 años puede resultar en arresto de 15 a 45 días o multa. Quedas bloqueado para empleos en gobierno, fuerzas armadas y para obtener pasaporte.',
  'licencia':      'Conducir sin licencia es una infracción grave: multa de hasta $3,000 pesos, arresto del vehículo y posible arresto administrativo. En caso de accidente, el seguro no cubre y la responsabilidad legal recae completamente sobre ti.',
  'conducir':      'Conducir sin licencia es una infracción grave: multa de hasta $3,000 pesos, arresto del vehículo y posible arresto administrativo. En caso de accidente, el seguro no cubre y la responsabilidad legal recae completamente sobre ti.',
  'pasaporte':     'Sin pasaporte no puedes salir del país bajo ninguna circunstancia. En urgencias como enfermedades o emergencias familiares en el extranjero, no habrá tiempo de tramitarlo. El proceso tarda entre 5 y 15 días hábiles.',
};
  private imagenes: Record<string, string> = {
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

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('tramiteSeleccionado');
    if (raw) {
      this.tramite = JSON.parse(raw);
    } else {
      this.router.navigate(['/principal-tramites']);
    }
  }

  // ── Devuelve la explicación de importancia según el nombre del trámite ──
  getImportancia(nombre: string = ''): string {
    const key = Object.keys(this.importancias).find(k =>
      nombre.toLowerCase().includes(k)
    );
    return key
      ? this.importancias[key]
      : 'Este trámite es parte de tus derechos y obligaciones como ciudadano mexicano mayor de edad.';
  }

  getImagen(nombre: string = ''): string {
    const key = Object.keys(this.imagenes).find(k =>
      nombre.toLowerCase().includes(k)
    );
    return key ? this.imagenes[key] : '/img/default.png';
  }

  getEstadoClass(estado: string = ''): string {
    const map: Record<string, string> = {
      'Pendiente':  'estado-pendiente',
      'Finalizado': 'estado-finalizado',
      'En proceso': 'estado-proceso',
    };
    return map[estado] ?? 'estado-pendiente';
  }

  irAtras(): void {
    this.router.navigate(['/principal-tramites']);
  }

  continuarProceso(): void {
    this.router.navigate(['/requisitos-tramites'], {
      queryParams: {
        tram_id:  this.tramite.tram_id,
        tram_tip: this.tramite.tram_tip
      }
    });
  }
}
