import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // ✅ Importa FormsModule
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthBackendService } from '../../services/auth-backend.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nueva-password',
  standalone: true, // ✅ Importante
  imports: [CommonModule, FormsModule], // ✅ Asegúrate de incluir FormsModule
  templateUrl: './nueva-password.component.html',
  styleUrls: ['./nueva-password.component.css']
})
export class NuevaPasswordComponent {

  password: string = '';
  loading: boolean = false;
  correo: string = localStorage.getItem('correo_recuperacion') || '';

  constructor(
    private authService: AuthBackendService,
    private router: Router
  ) {}

  cambiarPassword() {
    if (!this.password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña requerida',
        text: 'Ingresa tu nueva contraseña',
        confirmButtonColor: '#7b2cbf'
      });
      return;
    }

    this.loading = true;

    this.authService.cambiarPassword(this.correo, this.password).subscribe({
      next: (res: any) => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Contraseña cambiada',
          text: res.message || 'Tu contraseña ha sido actualizada',
          confirmButtonColor: '#7b2cbf'
        }).then(() => {
          this.router.navigateByUrl('/login');
        });
      },
      error: (err: any) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'No se pudo cambiar la contraseña',
          confirmButtonColor: '#7b2cbf'
        });
      }
    });
  }

}