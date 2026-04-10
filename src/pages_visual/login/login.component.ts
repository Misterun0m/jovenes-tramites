import { Component, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GoogleAuthService } from '../../services/google-auth.service';
import { AuthBackendService, ApiResponse } from '../../services/auth-backend.service';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import {
  trigger, style, animate, transition, query, stagger
} from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./Login.css'],
  animations: [
    trigger('cardEntrance', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px) scale(0.97)' }),
        animate('600ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })
        )
      ])
    ]),
    trigger('leftEntrance', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('700ms 100ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateX(0)' })
        )
      ])
    ]),
    trigger('formStagger', [
      transition(':enter', [
        query('.field-group, .greeting, h3, .subtitle, .d-flex, .btn-login, .divider-line, .divider-text, #googleButton', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(80, [
            animate('500ms cubic-bezier(0.16, 1, 0.3, 1)',
              style({ opacity: 1, transform: 'translateY(0)' })
            )
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class LoginComponent implements AfterViewInit {

  private readonly CLIENT_ID =
    '153731151960-0u024rio3rb5tcposlo188f9php8mhcc.apps.googleusercontent.com';

  private readonly SESSION_KEY = 'usuarioSesion';

  correo:       string  = '';
  password:     string  = '';
  isLoading:    boolean = false;
  showPassword: boolean = false;

  constructor(
    private googleAuth: GoogleAuthService,
    private backend:    AuthBackendService,
    private router:     Router,
    private zone:       NgZone,
    private cdr:        ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.googleAuth.initialize(this.CLIENT_ID, (response: any) => {
      this.zone.run(() => this.handleGoogleLogin(response));
    });
    this.googleAuth.renderButton('googleButton');
  }

  /* =========================
     TÉRMINOS Y CONDICIONES
  ========================= */
  private mostrarTerminos(): Promise<boolean> {
    return Swal.fire({
      title: '<strong>Términos y Condiciones</strong>',
      icon: 'info',
      width: '680px',
      html: `
        <div style="
          text-align: left;
          max-height: 340px;
          overflow-y: auto;
          font-size: 13.5px;
          line-height: 1.7;
          padding: 4px 8px;
          color: #333;
        ">
          <p>Al acceder y utilizar la aplicación web <strong>Inicio Ciudadano</strong>, aceptas cumplir con los presentes Términos y Condiciones. Si no estás de acuerdo, deberás abstenerse de utilizar la aplicación.</p>

          <h4 style="margin:14px 0 4px; color:#7b2cbf;">1. Descripción del servicio</h4>
          <p>Inicio Ciudadano orienta a jóvenes de 18 años sobre trámites ciudadanos en México: credencial para votar (INE), RFC, NSS, cartilla militar y licencia de conducir.</p>

          <h4 style="margin:14px 0 4px; color:#7b2cbf;">2. Uso adecuado</h4>
          <p>El usuario se compromete a usar la aplicación únicamente con fines informativos. Queda prohibido:</p>
          <ul style="padding-left:18px; margin:4px 0;">
            <li>Utilizar la aplicación para fines ilegales.</li>
            <li>Manipular, alterar o intentar acceder al código fuente.</li>
            <li>Usar la información con fines fraudulentos o engañosos.</li>
          </ul>

          <h4 style="margin:14px 0 4px; color:#7b2cbf;">3. Fuentes de información</h4>
          <p>La información proviene de fuentes oficiales del gobierno mexicano.</p>

          <h4 style="margin:14px 0 4px; color:#7b2cbf;">4. Limitación de responsabilidad</h4>
          <p>Los desarrolladores no se responsabilizan por cambios en requisitos de trámites gubernamentales ni por problemas con enlaces externos.</p>

          <h4 style="margin:14px 0 4px; color:#7b2cbf;">5. Protección de datos</h4>
          <p>Los datos serán tratados conforme a la <em>Ley Federal de Protección de Datos Personales en Posesión de los Particulares</em>.</p>

          <h4 style="margin:14px 0 4px; color:#7b2cbf;">6. Propiedad intelectual</h4>
          <p>El contenido y diseño son propiedad de sus desarrolladores. Queda prohibida su reproducción sin autorización.</p>

          <h4 style="margin:14px 0 4px; color:#7b2cbf;">7. Contacto</h4>
          <p>Para dudas: <a href="mailto:iniciociudadano@gmail.com" style="color:#7b2cbf;">iniciociudadano@gmail.com</a></p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Acepto los términos',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#7b2cbf',
      cancelButtonColor: '#9d4edd',
      reverseButtons: true
    }).then(result => result.isConfirmed);
  }

  /* =========================
     LOGIN NORMAL
  ========================= */
  loginNormal(): void {
    if (this.isLoading) return;

    const correoLimpio   = this.correo.trim();
    const passwordExacta = this.password;

    if (!correoLimpio || !passwordExacta) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'Ingresa tu correo y contraseña.',
        confirmButtonColor: '#7b2cbf'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoLimpio)) {
      Swal.fire({
        icon: 'warning',
        title: 'Correo inválido',
        text: 'Ingresa un correo electrónico con formato válido.',
        confirmButtonColor: '#7b2cbf'
      });
      return;
    }

    if (passwordExacta !== passwordExacta.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña con espacios',
        text: 'Tu contraseña no debe comenzar ni terminar con espacios.',
        confirmButtonColor: '#7b2cbf'
      });
      return;
    }

    if (/\s{2,}/.test(passwordExacta)) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña inválida',
        text: 'Tu contraseña no debe contener espacios consecutivos.',
        confirmButtonColor: '#7b2cbf'
      });
      return;
    }

    if (!passwordExacta.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña vacía',
        text: 'La contraseña no puede estar compuesta solo de espacios.',
        confirmButtonColor: '#7b2cbf'
      });
      return;
    }

    if (passwordExacta.trim().length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña muy corta',
        text: 'La contraseña debe tener al menos 6 caracteres.',
        confirmButtonColor: '#7b2cbf'
      });
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.backend.loginNormal(correoLimpio, passwordExacta)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res: ApiResponse) => {
          if (res.success) {
            if (res.user) localStorage.setItem(this.SESSION_KEY, JSON.stringify(res.user));
            this.navegarSegunDatos(res.user);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Credenciales incorrectas',
              text: res.message || 'Verifica tu correo o contraseña.',
              confirmButtonColor: '#7b2cbf'
            });
          }
        },
        error: (err) => {
          console.error('Error HTTP:', err);
          let mensaje = 'Error inesperado. Intenta de nuevo.';
          if (err.status === 0)    mensaje = 'Sin conexión con el servidor.';
          else if (err.status === 401) mensaje = 'Correo o contraseña incorrectos.';
          else if (err.status === 500) mensaje = 'Error interno del servidor.';

          Swal.fire({
            icon: 'error',
            title: 'Error al iniciar sesión',
            text: mensaje,
            confirmButtonColor: '#7b2cbf'
          });
        }
      });
  }

  /* =========================
     LOGIN GOOGLE
  ========================= */
  private handleGoogleLogin(response: any): void {
    if (!response?.credential) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener la credencial de Google',
        confirmButtonColor: '#7b2cbf'
      });
      return;
    }

    if (this.isLoading) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.backend.loginWithGoogle(response.credential)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: async (res: ApiResponse) => {
          if (res.success) {
            if (res.user) localStorage.setItem(this.SESSION_KEY, JSON.stringify(res.user));

            // ── Detectar si es usuario nuevo (sin sexo ni fecha) ──
            const esNuevo =
              !res.user?.user_sex?.trim() &&
              !res.user?.fecha_nacimiento?.trim();

            if (esNuevo) {
              const acepto = await this.mostrarTerminos();
              if (!acepto) {
                // Rechazó los términos — limpiar sesión y no continuar
                localStorage.removeItem(this.SESSION_KEY);
                return;
              }
            }

            this.navegarSegunDatos(res.user);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error con Google',
              text: res.message || 'No se pudo iniciar sesión',
              confirmButtonColor: '#7b2cbf'
            });
          }
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al iniciar sesión con Google',
            confirmButtonColor: '#7b2cbf'
          });
        }
      });
  }

  /* =========================
     REDIRECCIÓN SEGÚN DATOS
  ========================= */
  private navegarSegunDatos(user: any): void {
    const userSex  = user?.user_sex         ?? '';
    const fechaNac = user?.fecha_nacimiento ?? '';

    const faltaSexo  = typeof userSex  !== 'string' || !userSex.trim();
    const faltaFecha = typeof fechaNac !== 'string' || !fechaNac.trim();
    const faltaDatos = faltaSexo || faltaFecha;

    const userGuardado = localStorage.getItem(this.SESSION_KEY);
    if (!userGuardado) return;

    if (faltaDatos) {
      const items: string[] = [];
      if (faltaSexo)  items.push('<li>Sexo biológico</li>');
      if (faltaFecha) items.push('<li>Fecha de nacimiento</li>');

      Swal.fire({
        icon: 'info',
        title: 'Perfil incompleto',
        html: `
          <p style="margin-bottom:10px;">Para continuar debes completar:</p>
          <ul style="text-align:left; display:inline-block; color:#7b2cbf;
                     font-weight:600; line-height:2; list-style:none; padding:0;">
            ${items.join('')}
          </ul>
        `,
        confirmButtonText: 'Completar perfil',
        confirmButtonColor: '#7b2cbf',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.zone.run(() => this.router.navigate(['/pantalla_usuario']));
        }
      });

    } else {
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Inicio de sesión exitoso',
        confirmButtonColor: '#7b2cbf',
        timer: 1800,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false
      }).then(() => {
        this.zone.run(() => this.router.navigate(['/principal-tramites']));
      });
    }
  }
}