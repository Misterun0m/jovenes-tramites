import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatFlotanteComponent } from '../components/chat_flotante/chat-flotante.componet';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatFlotanteComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('JovenesTramites');
  nombreproyecto = 'Aprendiendo Angular 19 en adelante';
}
