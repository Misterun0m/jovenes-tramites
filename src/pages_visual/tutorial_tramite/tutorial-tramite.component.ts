import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatFlotanteComponent } from "../../components/chat_flotante/chat-flotante.componet";

@Component({
  selector: 'app-tutorial-tramite',
  standalone: true,
  imports: [CommonModule, ChatFlotanteComponent],
  templateUrl: './tutorial_tramite.html',
  styleUrls: ['./tutorial-tramite.component.css']
})
export class TutorialTramiteComponent {

  constructor(private router: Router) {}

  irPantallaUsuario() {
    this.router.navigate(['/pantalla_usuario']);
  }
}