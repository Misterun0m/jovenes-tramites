import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrls: ['./estilo_inicio.css'],
  encapsulation: ViewEncapsulation.None
})
export class InicioComponent {

  constructor(private router: Router) {}

  tramiteSeleccionado: any = null;

  tramites = [
    {
      id: 'INE',
      nombre: 'Credencial INE',
      descripcion: 'Identificación oficial para votar y realizar trámites.',
      icono: 'bi-person-vcard',
      iconClass: 'icon-ine',
      emoji: '🗳️',
      proximamente: false,
      dato: 'Cada año, <strong>miles de jóvenes pierden su derecho a votar</strong> porque no tramitaron su INE a tiempo. El proceso cierra meses antes de las elecciones y no hay excepciones.',
      pasos: [
        { texto: 'Agenda tu cita en el módulo del INE más cercano a ti', visible: true },
        { texto: 'Reúne tu acta de nacimiento original y tu CURP impresa', visible: true },
        { texto: 'Documentos adicionales según tu situación y tiempo de espera en módulo', visible: false },
        { texto: 'Cuánto tarda en llegar y qué hacer si hay errores', visible: false },
      ]
    },
    {
      id: 'Cartilla',
      nombre: 'Cartilla Militar',
      descripcion: 'Documento obligatorio para hombres al cumplir 18 años.',
      icono: 'bi-shield-fill',
      iconClass: 'icon-cartilla',
      emoji: '🪖',
      proximamente: false,
      dato: 'La cartilla militar es <strong>obligatoria para todos los hombres mexicanos</strong> al cumplir 18 años. Sin ella no puedes obtener empleo formal, pasaporte ni muchos trámites gubernamentales.',
      pasos: [
        { texto: 'Localiza la delegación o junta municipal de reclutamiento más cercana', visible: true },
        { texto: 'Reúne acta de nacimiento, CURP y fotografías tamaño infantil', visible: true },
        { texto: 'Proceso de registro, sorteo y liberación de obligaciones militares', visible: false },
        { texto: 'Qué hacer si perdiste tu cartilla o tiene errores', visible: false },
      ]
    },
    {
      id: 'CURP',
      nombre: 'CURP',
      descripcion: 'Clave Única de Registro de Población.',
      icono: 'bi-person-badge-fill',
      iconClass: 'icon-curp',
      emoji: '📋',
      proximamente: false,
      dato: 'Tu CURP <strong>puede tener errores</strong> sin que lo sepas — y eso puede bloquearte al tramitar tu INE, RFC o pasaporte. El <strong>30% de los jóvenes</strong> descubren errores hasta que intentan hacer otro trámite.',
      pasos: [
        { texto: 'Entra a gob.mx y busca tu CURP con tu nombre y fecha de nacimiento', visible: true },
        { texto: 'Verifica que todos tus datos estén correctos antes de imprimirla', visible: true },
        { texto: 'Cómo corregir errores oficialmente sin ir a ninguna oficina', visible: false },
        { texto: 'Usos del CURP y por qué necesitas la versión actualizada', visible: false },
      ]
    },
    {
      id: 'RFC',
      nombre: 'RFC',
      descripcion: 'Registro Federal de Contribuyentes para trabajar.',
      icono: 'bi-file-earmark-text',
      iconClass: 'icon-rfc',
      emoji: '💼',
      proximamente: false,
      dato: 'Sin RFC <strong>no puedes recibir un sueldo formal ni facturar</strong>. Lo que pocos saben: puedes tramitarlo completamente en línea en menos de <strong>20 minutos</strong>, pero hay un paso que casi todos hacen mal.',
      pasos: [
        { texto: 'Crea tu cuenta en el portal del SAT con tu CURP y correo', visible: true },
        { texto: 'Genera tu RFC y descarga tu constancia de situación fiscal', visible: true },
        { texto: 'El paso de la e.firma que casi todos omiten (y que te va a hacer falta)', visible: false },
        { texto: 'Obligaciones fiscales básicas que debes conocer desde el día 1', visible: false },
      ]
    },
    {
      id: 'IMSS',
      nombre: 'IMSS / NSS',
      descripcion: 'Número de Seguridad Social para servicios médicos.',
      icono: 'bi-heart-pulse',
      iconClass: 'icon-imss',
      emoji: '🏥',
      proximamente: false,
      dato: 'Muchos jóvenes <strong>tienen IMSS y no lo saben</strong> — si alguna vez trabajaste formalmente, ya tienes un NSS asignado. Recuperarlo toma 5 minutos, pero sin él podrías perder años de semanas cotizadas para tu pensión.',
      pasos: [
        { texto: 'Entra a imss.gob.mx y busca tu NSS con tu CURP', visible: true },
        { texto: 'Descarga tu constancia oficial de Número de Seguridad Social', visible: true },
        { texto: 'Qué servicios médicos puedes usar desde hoy y cómo acceder', visible: false },
        { texto: 'Cómo proteger tus semanas cotizadas aunque cambies de trabajo', visible: false },
      ]
    },
    {
      id: 'Proximamente',
      nombre: 'Próximamente',
      descripcion: 'Nuevos trámites en camino para ti.',
      icono: 'bi-hourglass-split',
      iconClass: 'icon-proximamente',
      emoji: '🚀',
      proximamente: true,
      dato: '',
      pasos: []
    }
  ];

  seleccionarTramite(tramite: any) {
    if (tramite.proximamente) return;
    this.tramiteSeleccionado = tramite;
    setTimeout(() => {
      const panel = document.getElementById('teaserPanel');
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }

  irARegistro() { this.router.navigate(['/registro']); }
  irALogin()    { this.router.navigate(['/login']); }
}