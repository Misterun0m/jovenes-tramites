import { Routes } from '@angular/router';

import { InicioComponent } from '../pages_visual/inicio/inicio.component';
import { LoginComponent } from '../pages_visual/login/login.component';
import { PantallaUsuarioComponent } from '../pages_visual/pantalla_usuario/pantalla-usuario.component';
import { RegistroComponent } from '../pages_visual/registro/registro.component';
import { RecuperarComponent } from '../pages_visual/recuperar/recuperar.component';
import { CodigoComponent } from '../pages_visual/codigo/codigo.component';
import { NuevaPasswordComponent } from '../pages_visual/nueva-password/nueva-password.component';
import { TutorialTramiteComponent } from '../pages_visual/tutorial_tramite/tutorial-tramite.component';
import { AuthGuard } from '../services/auth.guard';
import { AuthRecuperacionGuard } from '../services/auth-recuperacion.guard';

export const routes: Routes = [
  // Página de inicio pública
  { path: '', component: InicioComponent },

  // Accesibles sin iniciar sesión
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'recuperar', component: RecuperarComponent },

  // Flujo de recuperación protegido
  { path: 'codigo', component: CodigoComponent, canActivate: [AuthRecuperacionGuard] },
  { path: 'nueva-password', component: NuevaPasswordComponent, canActivate: [AuthRecuperacionGuard] },

  // Rutas protegidas por login
  { path: 'pantalla_usuario', component: PantallaUsuarioComponent, canActivate: [AuthGuard] },
  { path: 'tutorial-tramite', component: TutorialTramiteComponent, canActivate: [AuthGuard] },

  // Redirección para rutas desconocidas
  { path: '**', redirectTo: '' }
];