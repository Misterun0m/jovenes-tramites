import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RegistroComponent {

  showPassword: boolean = false;
  cargando: boolean = false;
  static yaRegistrando: boolean = false;

  usuario = {
    user_nom: '',
    user_sex: '',
    fecha_nacimiento: '',
    user_correo: '',
    user_pass: ''
  };

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  // ─── Muestra modal de Términos y Condiciones ───────────────────────────────
  private mostrarTerminos(): Promise<boolean> {
    return Swal.fire({
      title: '<strong>Términos y Condiciones</strong>',
      icon: 'info',
      width: '680px',
      html: `
        <div style="
          text-align: left;
          max-height: 380px;
          overflow-y: auto;
          font-size: 13.5px;
          line-height: 1.7;
          padding: 4px 8px;
          color: #333;
        ">
          <p>Al acceder y utilizar la aplicación web <strong>Inicio Ciudadano</strong>, aceptas cumplir con los presentes Términos y Condiciones. Si no estás de acuerdo, deberás abstenerse de utilizar la aplicación.</p>

          <h4 style="margin:14px 0 4px; color:#7b2cbf;">1. Descripción del servicio</h4>
          <p>Inicio Ciudadano es una plataforma informativa para jóvenes que han cumplido 18 años, orientada a guiarlos en trámites ciudadanos en México: credencial para votar (INE), RFC, NSS, cartilla militar y licencia de conducir.</p>

          <h4 style="margin:14px 0 4px; color:#7b2cbf;">2. Uso adecuado</h4>
          <p>El usuario se compromete a usar la aplicación de manera responsable y únicamente con fines informativos. Queda prohibido:</p>
          <ul style="padding-left:18px; margin:4px 0;">
            <li>Utilizar la aplicación para fines ilegales.</li>
            <li>Manipular, alterar o intentar acceder al código fuente.</li>
            <li>Usar la información con fines fraudulentos o engañosos.</li>
          </ul>

          <h4 style="margin:14px 0 4px; color:#7b2cbf;">3. Fuentes de información</h4>
          <p>La información proviene de fuentes oficiales del gobierno mexicano (portales institucionales y organismos públicos).</p>

          <h4 style="margin:14px 0 4px; color:#7b2cbf;">4. Limitación de responsabilidad</h4>
          <p>Los desarrolladores no se hacen responsables por cambios en requisitos de trámites gubernamentales ni por problemas derivados del uso de enlaces externos. La aplicación funciona únicamente como herramienta de orientación.</p>

          <h4 style="margin:14px 0 4px; color:#7b2cbf;">5. Protección de datos</h4>
          <p>Los datos personales serán tratados conforme a la <em>Ley Federal de Protección de Datos Personales en Posesión de los Particulares</em>, garantizando su confidencialidad y protección.</p>

          <h4 style="margin:14px 0 4px; color:#7b2cbf;">6. Propiedad intelectual</h4>
          <p>El contenido, diseño y elementos visuales son propiedad de sus desarrolladores. Queda prohibida su reproducción o modificación sin autorización previa.</p>

          <h4 style="margin:14px 0 4px; color:#7b2cbf;">7. Modificaciones</h4>
          <p>Los desarrolladores se reservan el derecho de modificar estos términos en cualquier momento. Los cambios serán publicados dentro de la aplicación.</p>

          <h4 style="margin:14px 0 4px; color:#7b2cbf;">8. Contacto</h4>
          <p>Para dudas: <a href="mailto:iniciociudadano@gmail.com" style="color:#7b2cbf;">iniciociudadano@gmail.com</a></p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Acepto los términos',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#7b2cbf',
      cancelButtonColor: '#9d4edd',
      reverseButtons: true,
      customClass: {
        popup: 'terminos-popup'
      }
    }).then(result => result.isConfirmed);
  }

  // ─── Registro con formulario ───────────────────────────────────────────────
  async registrar(event?: Event) {
    event?.stopPropagation();
    event?.preventDefault();

    if (this.cargando || RegistroComponent.yaRegistrando) return;

    // Validaciones
    if (!this.usuario.user_nom || !this.usuario.user_correo || !this.usuario.user_pass) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Por favor completa todos los campos obligatorios', confirmButtonColor: '#7b2cbf' });
      return;
    }
    if (!this.usuario.user_sex) {
      Swal.fire({ icon: 'warning', title: 'Selecciona tu sexo', text: 'Por favor selecciona Femenino o Masculino', confirmButtonColor: '#7b2cbf' });
      return;
    }
    if (this.usuario.user_pass.length < 6) {
      Swal.fire({ icon: 'warning', title: 'Contraseña muy corta', text: 'La contraseña debe tener al menos 6 caracteres', confirmButtonColor: '#7b2cbf' });
      return;
    }

    const calculoEdad = (fecha: string) => {
      const hoy = new Date();
      const nacimiento = new Date(fecha);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const m = hoy.getMonth() - nacimiento.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) { edad--; }
      return edad;
    };

    if (calculoEdad(this.usuario.fecha_nacimiento) < 18) {
      Swal.fire({ icon: 'warning', title: 'Fecha de nacimiento inválida', text: 'Por favor selecciona una fecha de nacimiento válida', confirmButtonColor: '#7b2cbf' });
      return;
    }

    // ── Mostrar Términos y Condiciones antes de registrar ──
    const acepto = await this.mostrarTerminos();
    if (!acepto) return; // El usuario canceló

    // Proceder con el registro
    this.cargando = true;
    RegistroComponent.yaRegistrando = true;

    this.usuarioService.registrar(this.usuario).subscribe({
      next: (res: any) => {
        this.cargando = false;
        RegistroComponent.yaRegistrando = false;
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: `Bienvenido a Trámites 18+. Se te asignaron ${res.tramites_asignados ?? 5} trámites para comenzar.`,
          confirmButtonColor: '#7b2cbf'
        }).then(() => this.router.navigate(['/login']));
      },
      error: (err: any) => {
        this.cargando = false;
        RegistroComponent.yaRegistrando = false;

        if (err.status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'Correo ya registrado',
            text: `El correo "${this.usuario.user_correo}" ya tiene una cuenta. ¿Quieres iniciar sesión?`,
            confirmButtonText: 'Ir al login',
            cancelButtonText: 'Usar otro correo',
            showCancelButton: true,
            confirmButtonColor: '#7b2cbf',
            cancelButtonColor: '#9d4edd'
          }).then(result => {
            if (result.isConfirmed) this.router.navigate(['/login']);
          });
          return;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: err.error?.error || 'No se pudo completar el registro. Intenta de nuevo.',
          confirmButtonColor: '#7b2cbf'
        });
      }
    });
  }

  // ─── Registro / login con Google (llamar desde tu handler de Google) ───────
  async manejarGoogleCallback(datosGoogle: { correo: string; nombre: string }, esNuevoUsuario: boolean) {
    if (esNuevoUsuario) {
      const acepto = await this.mostrarTerminos();
      if (!acepto) return; // No proceder si rechaza
    }

    // Tu lógica existente de Google aquí...
    // this.usuarioService.loginGoogle(datosGoogle).subscribe(...)
  }
}