import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router ,RouterModule } from '@angular/router';
import { AuthBackendService } from '../../services/auth-backend.service';

import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recuperar',
  standalone: true,
 imports: [FormsModule, CommonModule,RouterModule],
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.css']
})
export class RecuperarComponent {

  correo = '';
  loading = false;

  constructor(
    private authService: AuthBackendService,
    private router: Router
  ) {}

  enviarCodigo(){

    if(!this.correo){

      Swal.fire({
        icon: 'warning',
        title: 'Correo requerido',
        text: 'Ingresa tu correo electrónico'
      });

      return;
    }

    this.loading = true;

    this.authService.enviarCodigo(this.correo)
    .subscribe({

      next:(res:any)=>{

        this.loading = false;

        Swal.fire({
          icon: 'success',
          title: 'Código enviado',
          text: res.message || 'Revisa tu correo electrónico',
          confirmButtonColor: '#7b2cbf'
        });

        localStorage.setItem("correo_recuperacion", this.correo);

        this.router.navigate(['/codigo']);

      },

      error:(err)=>{

        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'No se pudo enviar el código',
          confirmButtonColor: '#7b2cbf'
        });

      }

    });

  }

}