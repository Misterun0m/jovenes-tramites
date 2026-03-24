import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrls: ['./estilo_inicio.css'],
  encapsulation: ViewEncapsulation.None  // ✅ Esto hace que el CSS aplique globalmente
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
      dato: 'Cada año, <strong>miles de jóvenes pierden su derecho a votar</strong> porque no tramitaron su INE a tiempo. El proceso cierra meses antes de las elecciones y no hay excepciones.',
      pasos: [
        { texto: 'Agenda tu cita en el módulo del INE más cercano a ti', visible: true },
        { texto: 'Reúne tu acta de nacimiento original y tu CURP impresa', visible: true },
        { texto: 'Documentos adicionales según tu situación y tiempo de espera en módulo', visible: false },
        { texto: 'Cuánto tarda en llegar y qué hacer si hay errores', visible: false },
      ]
    },
    {
      id: 'Pasaporte',
      nombre: 'Pasaporte',
      descripcion: 'Documento necesario para viajar al extranjero.',
      icono: 'bi-airplane-engines',
      iconClass: 'icon-pasaporte',
      emoji: '',
      dato: 'El pasaporte mexicano es uno de los <strong>más poderosos de América Latina</strong> — te da acceso sin visa a más de 65 países. Pero tramitarlo puede tardar hasta <strong>4 semanas</strong> si no sabes cómo hacerlo bien.',
      pasos: [
        { texto: 'Ingresa al portal de la SRE y elige tu oficina de pasaportes', visible: true },
        { texto: 'Reúne acta de nacimiento certificada y CURP actualizada', visible: true },
        { texto: 'Cuánto cuesta según tu edad y tipo de pasaporte + dónde pagar', visible: false },
        { texto: 'Cómo acelerar la entrega si tienes viaje urgente', visible: false },
      ]
    },
    {
      id: 'CURP',
      nombre: 'CURP',
      descripcion: 'Clave única de registro poblacional.',
      icono: 'bi-person-badge-fill',
      iconClass: 'icon-curp',
      emoji: '',
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
      emoji: '',
      dato: 'Sin RFC <strong>no puedes recibir un sueldo formal ni facturar</strong>. Lo que pocos saben: puedes tramitarlo completamente en línea en menos de <strong>20 minutos</strong>, pero hay un paso que casi todos hacen mal.',
      pasos: [
        { texto: 'Crea tu cuenta en el portal del SAT con tu CURP y correo', visible: true },
        { texto: 'Genera tu RFC y descarga tu constancia de situación fiscal', visible: true },
        { texto: 'El paso de la e.firma que casi todos omiten (y que te va a hacer falta)', visible: false },
        { texto: 'Obligaciones fiscales básicas que debes conocer desde el día 1', visible: false },
      ]
    },
    {
      id: 'Licencia',
      nombre: 'Licencia de conducir',
      descripcion: 'Permiso oficial para conducir vehículos.',
      icono: 'bi-car-front-fill',
      iconClass: 'icon-licencia',
      emoji: '',
      dato: 'El <strong>examen de manejo reprueba al 40% de los jóvenes</strong> en su primer intento — no por no saber manejar, sino por no conocer las reglas exactas que evalúan. Nosotros te decimos exactamente qué estudiar.',
      pasos: [
        { texto: 'Identifica el tipo de licencia que necesitas según tu vehículo', visible: true },
        { texto: 'Agenda cita en la oficina de tránsito de tu municipio', visible: true },
        { texto: 'Los 10 puntos exactos que evalúan en el examen de manejo', visible: false },
        { texto: 'Costos por estado, vigencia y cómo renovarla sin hacer fila', visible: false },
      ]
    },
    {
      id: 'IMSS',
      nombre: 'IMSS / NSS',
      descripcion: 'Número de seguridad social para servicios médicos.',
      icono: 'bi-heart-pulse',
      iconClass: 'icon-imss',
      emoji: '',
      dato: 'Muchos jóvenes <strong>tienen IMSS y no lo saben</strong> — si alguna vez trabajaste formalmente, ya tienes un NSS asignado. Recuperarlo toma 5 minutos, pero sin él podrías perder años de semanas cotizadas para tu pensión.',
      pasos: [
        { texto: 'Entra a imss.gob.mx y busca tu NSS con tu CURP', visible: true },
        { texto: 'Descarga tu constancia oficial de número de seguridad social', visible: true },
        { texto: 'Qué servicios médicos puedes usar desde hoy y cómo acceder', visible: false },
        { texto: 'Cómo proteger tus semanas cotizadas aunque cambies de trabajo', visible: false },
      ]
    }
  ];
seleccionarTramite(tramite: any) {
  this.tramiteSeleccionado = tramite;

  // Espera a que Angular renderice el panel y luego hace scroll
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
