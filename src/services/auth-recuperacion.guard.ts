import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthRecuperacionGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {

    const correo = localStorage.getItem('correo_recuperacion');
    const codigoVerificado = localStorage.getItem('codigo_verificado');

    // Si estamos en /nueva-password, requiere código verificado
    if (window.location.pathname.includes('nueva-password') && !codigoVerificado) {
      return this.router.parseUrl('/recuperar');
    }

    // Si estamos en /codigo, requiere correo
    if (window.location.pathname.includes('codigo') && !correo) {
      return this.router.parseUrl('/recuperar');
    }

    // /recuperar siempre accesible, pero evita ir a /codigo o /nueva-password sin flujo
    return true;
  }
}