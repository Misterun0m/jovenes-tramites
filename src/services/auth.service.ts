import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthBackendService } from './auth-backend.service';
import { LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private backend: AuthBackendService,
    private router: Router
  ) {}

  loginNormal(correo: string, password: string) {
    return this.backend.loginNormal(correo, password);
  }

  loginGoogle(token: string) {
    return this.backend.loginWithGoogle(token);
  }

  handleSuccess(res: LoginResponse) {
    if (res.user) {
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    this.router.navigateByUrl('/pantalla_usuario');
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigateByUrl('/login');
  }
}