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

  registrar(event?: Event) {
    event?.stopPropagation();
    event?.preventDefault();

    if (this.cargando || RegistroComponent.yaRegistrando) return;

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
    } 
    if (calculoEdad(this.usuario.fecha_nacimiento) < 18) {
      Swal.fire({ icon: 'warning', title: 'Fecha de nacimiento inválida', text: 'Por favor selecciona una fecha de nacimiento válida', confirmButtonColor: '#7b2cbf' });
      return;
    }

   
  
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
}
