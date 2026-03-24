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
   LOGIN NORMAL
========================= */
loginNormal(): void {
  if (this.isLoading) return;

  const correoLimpio   = this.correo.trim();
  // NO hacemos trim() a la contraseña — la tomamos exactamente como se escribió
  const passwordExacta = this.password;

  // ── 1. Campos vacíos ──────────────────────────────────────────
  if (!correoLimpio || !passwordExacta) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos obligatorios',
      text: 'Ingresa tu correo y contraseña.',
      confirmButtonColor: '#7b2cbf'
    });
    return;
  }

  // ── 2. Formato de correo ───────────────────────────────────────
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

  // ── 3. Espacio al inicio o al final de la contraseña ──────────
  if (passwordExacta !== passwordExacta.trim()) {
    Swal.fire({
      icon: 'error',
      title: 'Contraseña con espacios',
      text: 'Tu contraseña no debe comenzar ni terminar con espacios.',
      confirmButtonColor: '#7b2cbf'
    });
    return;
  }

  // ── 4. Espacios consecutivos dentro de la contraseña ──────────
  if (/\s{2,}/.test(passwordExacta)) {
    Swal.fire({
      icon: 'error',
      title: 'Contraseña inválida',
      text: 'Tu contraseña no debe contener espacios consecutivos.',
      confirmButtonColor: '#7b2cbf'
    });
    return;
  }

  // ── 5. Solo espacios (contraseña en blanco disfrazada) ─────────
  if (!passwordExacta.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Contraseña vacía',
      text: 'La contraseña no puede estar compuesta solo de espacios.',
      confirmButtonColor: '#7b2cbf'
    });
    return;
  }

  // ── 6. Longitud mínima ─────────────────────────────────────────
  if (passwordExacta.trim().length < 6) {
    Swal.fire({
      icon: 'warning',
      title: 'Contraseña muy corta',
      text: 'La contraseña debe tener al menos 6 caracteres.',
      confirmButtonColor: '#7b2cbf'
    });
    return;
  }

  // ── Todo OK: llamar al backend con la contraseña EXACTA ────────
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
        next: (res: ApiResponse) => {
          if (res.success) {
            if (res.user) localStorage.setItem(this.SESSION_KEY, JSON.stringify(res.user));
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
    // FIX PRINCIPAL: user_sex y fecha_nacimiento pueden ser null,
    // undefined o string vacío — se normaliza todo antes de .trim()
    const userSex  = user?.user_sex          ?? '';
    const fechaNac = user?.fecha_nacimiento  ?? '';

    // FIX: typeof string antes de llamar .trim() para evitar crash con null
    const faltaSexo  = typeof userSex  !== 'string' || !userSex.trim();
    const faltaFecha = typeof fechaNac !== 'string' || !fechaNac.trim();
    const faltaDatos = faltaSexo || faltaFecha;

    // Verificar que se guardó correctamente antes de navegar
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
