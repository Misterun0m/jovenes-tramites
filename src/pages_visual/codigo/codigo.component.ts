import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthBackendService } from '../../services/auth-backend.service';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-codigo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './codigo.component.html',
  styleUrls: ['./codigo.component.css']
})
export class CodigoComponent {

  codigo: string = '';
  correo: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthBackendService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {

    const correoGuardado = localStorage.getItem("correo_recuperacion");

    if (correoGuardado) {
      this.correo = correoGuardado;
    } 
    else {

      Swal.fire({
        icon: 'warning',
        title: 'Sesión expirada',
        text: 'Debes iniciar nuevamente el proceso de recuperación',
        confirmButtonColor: '#6a11cb'
      }).then(() => {
        this.router.navigate(['/recuperar']);
      });

    }

  }

  /* =========================
     OTP INPUT LOGIC
  ========================= */

  moveNext(event: any, nextInput?: HTMLInputElement) {

    const input = event.target;

    if (input.value.length === 1 && nextInput) {
      nextInput.focus();
    }

    if (event.key === "Backspace" && !input.value) {
      const prev = input.previousElementSibling as HTMLInputElement;
      if (prev) prev.focus();
    }

    this.updateCodigo();
  }

  updateCodigo() {

    const inputs = document.querySelectorAll('.otp-inputs input');

    let code = '';

    inputs.forEach((input: any) => {
      code += input.value;
    });

    this.codigo = code;
  }

  pegarCodigo(event: ClipboardEvent) {

    const paste = event.clipboardData?.getData('text') || '';

    if (paste.length === 6) {

      const inputs = document.querySelectorAll('.otp-inputs input');

      inputs.forEach((input: any, index) => {
        input.value = paste[index] || '';
      });

      this.codigo = paste;
      event.preventDefault();
    }

  }

  /* =========================
     VERIFICAR CODIGO
  ========================= */

  verificarCodigo(): void {

    if (this.loading) return;

    if (!this.codigo || this.codigo.length < 6) {

      Swal.fire({
        icon: 'warning',
        title: 'Código incompleto',
        text: 'Ingresa el código de verificación completo',
        confirmButtonColor: '#6a11cb'
      });

      return;
    }

    this.loading = true;

    this.authService.verificarCodigo(this.correo, this.codigo)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Código verificado',
            text: 'Ahora puedes crear una nueva contraseña',
            confirmButtonColor: '#6a11cb'
          }).then(() => {

            localStorage.setItem("codigo_verificado", this.codigo);
            this.router.navigate(['/nueva-password']);

          });

        },

        error: () => {

          Swal.fire({
            icon: 'error',
            title: 'Código incorrecto',
            text: 'Verifica el código e intenta nuevamente',
            confirmButtonColor: '#6a11cb'
          });

        }

      });

  }

  /* =========================
     REENVIAR CODIGO
  ========================= */

  reenviarCodigo(): void {

    if (this.loading) return;

    this.loading = true;

    this.authService.enviarCodigo(this.correo)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Código reenviado',
            text: 'Revisa tu correo electrónico',
            confirmButtonColor: '#6a11cb'
          });

        },

        error: () => {

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo reenviar el código',
            confirmButtonColor: '#6a11cb'
          });

        }

      });

  }

}