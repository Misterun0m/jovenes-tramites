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
    // Card completa: fade + sube + escala leve
    trigger('cardEntrance', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px) scale(0.97)' }),
        animate('600ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })
        )
      ])
    ]),

    // Lado izquierdo: fade + viene desde la izquierda
    trigger('leftEntrance', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('700ms 100ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateX(0)' })
        )
      ])
    ]),

    // Formulario: cada elemento entra escalonado
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

  correo: string = '';
  password: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private googleAuth: GoogleAuthService,
    private backend: AuthBackendService,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
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

    if (!this.correo.trim() || !this.password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'Ingresa tu correo y contraseña',
        confirmButtonColor: '#7b2cbf'
      });
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.backend.loginNormal(this.correo.trim(), this.password.trim())
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res: ApiResponse) => {
          if (res.success) {
            if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
            this.navegarSegunDatos(res.user);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Credenciales incorrectas',
              text: res.message || 'Verifica tu correo o contraseña',
              confirmButtonColor: '#7b2cbf'
            });
          }
        },
        error: (err) => {
          console.error('Error HTTP:', err);
          let mensaje = 'Error inesperado';
          if (err.status === 0) mensaje = 'No hay conexión con el servidor';
          else if (err.status === 401) mensaje = 'Correo o contraseña incorrectos';
          else if (err.status === 500) mensaje = 'Error interno del servidor';

          Swal.fire({
            icon: 'error',
            title: 'Error',
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
            if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
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
     REDIRECCION SEGUN DATOS
  ========================= */
  private navegarSegunDatos(user: any): void {
    const userSex  = user?.user_sex         ?? '';
    const fechaNac = user?.fecha_nacimiento ?? '';

    const faltaSexo  = !userSex.trim();
    const faltaFecha = !fechaNac.trim();
    const faltaDatos = faltaSexo || faltaFecha;

    const userGuardado = localStorage.getItem('user');
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
        this.zone.run(() => this.router.navigate(['/tutorial-tramite']));
      });
    }
  }
}

