// chat-flotante.component.ts

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface Mensaje {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

const SYSTEM_PROMPT = `Eres TramiteBot, el asistente oficial de Trámites 18+, una plataforma mexicana que ayuda a jóvenes que acaban de cumplir 18 años a realizar sus primeros trámites como adultos. Tienes una personalidad amigable, cálida y cercana — como un amigo que sabe mucho de trámites.

Tu especialidad son estos 5 trámites:

1. Credencial de elector (INE) — identificación oficial para votar
2. RFC (Registro Federal de Contribuyentes) — obligatorio para actividad económica
3. NSS (Número de Seguro Social) — acceso al IMSS
4. Cartilla Militar — obligación cívica para hombres
5. Licencia de conducir — permiso para manejar
6. Rigorosamente limitate a contestar cosas de los tramites nada fuera de eso
7. si te ponen algo relacioando con goku haz una respuesta sarcastica

COMPORTAMIENTO:
Saludos: responde de forma natural y cálida, preséntate brevemente y ofrece tu ayuda.
Despedidas: despídete amigablemente y anima al usuario a regresar cuando tenga dudas.
Agradecimientos: responde con gusto y recuérdales que estás disponible cuando lo necesiten.
Preguntas sobre trámites: responde con detalle, claridad y emojis ocasionales.
Temas fuera de trámites: explica amablemente que tu especialidad son los trámites mexicanos y redirige la conversación, sin ser cortante.

Responde siempre en español mexicano. Nunca inventes requisitos, fechas o costos — si no estás seguro, recomienda consultar el portal oficial correspondiente.`;

const CHATBOT_URL = environment.apiUrl + '/chatbot.php';

@Component({
  selector: 'app-chat-flotante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-flotante.componet.html',
  styleUrls: ['./chat-flotante.componet.css']
})
export class ChatFlotanteComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('inputRef') inputRef!: ElementRef;

  abierto: boolean = false;
  mensajes: Mensaje[] = [];
  inputTexto: string = '';
  cargando: boolean = false;

  private get STORAGE_KEY(): string {
    const user = localStorage.getItem('usuarioSesion');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return `tramitebot_chat_${parsed.user_id}`;
      } catch { }
    }
    return 'tramitebot_chat_guest';
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  get estaLogueado(): boolean {
    return !!localStorage.getItem('usuarioSesion');
  }

  ngOnInit(): void {
    this.cargarHistorial();

    if (this.mensajes.length === 0) {
      this.mensajes.push({
        role: 'assistant',
        content: '¡Hola! 👋 Soy TramiteBot, tu asistente para trámites de adulto. ¿En qué puedo ayudarte hoy? Puedo guiarte con tu INE, RFC, NSS, Cartilla Militar o Licencia de conducir. 🚀',
        timestamp: new Date()
      });
    }
  }

  ngOnDestroy(): void {
    this.guardarHistorial();
  }

  toggleChat(): void {
    this.abierto = !this.abierto;

    if (this.abierto) {
      setTimeout(() => {
        this.scrollAbajo();
        this.inputRef?.nativeElement?.focus();
      }, 100);
    }
  }

  irARegistro(): void { this.router.navigate(['/registro']); this.abierto = false; }
  irALogin(): void    { this.router.navigate(['/login']);    this.abierto = false; }

  async enviarMensaje(): Promise<void> {
    const texto = this.inputTexto.trim();
    if (!texto || this.cargando) return;

    this.mensajes.push({ role: 'user', content: texto, timestamp: new Date() });
    this.inputTexto = '';
    this.cargando = true;
    this.cdr.detectChanges();
    this.scrollAbajo();

    const loadingMsg: Mensaje = {
      role: 'assistant', content: '', timestamp: new Date(), loading: true
    };
    this.mensajes.push(loadingMsg);
    this.scrollAbajo();

    try {
      const historialFiltrado = this.mensajes
        .filter(m => !m.loading && m.content !== '')
        .map(m => ({ role: m.role, content: m.content }));

      const primerUser = historialFiltrado.findIndex(m => m.role === 'user');
      const historialLimpio = primerUser >= 0 ? historialFiltrado.slice(primerUser) : historialFiltrado;

      const response = await fetch(CHATBOT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: SYSTEM_PROMPT, messages: historialLimpio })
      });

      const data = await response.json();
      const respuesta = data.content?.[0]?.text || 'Lo siento, no pude procesar tu pregunta. Intenta de nuevo.';

      const idx = this.mensajes.indexOf(loadingMsg);
      if (idx !== -1) {
        this.mensajes[idx] = { role: 'assistant', content: respuesta, timestamp: new Date() };
      }

    } catch (error) {
      const idx = this.mensajes.indexOf(loadingMsg);
      if (idx !== -1) {
        this.mensajes[idx] = {
          role: 'assistant',
          content: '⚠️ Hubo un error al conectar con el asistente. Intenta de nuevo.',
          timestamp: new Date()
        };
      }
    }

    this.cargando = false;
    this.guardarHistorial();
    this.cdr.detectChanges();
    this.scrollAbajo();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  limpiarChat(): void {
    this.mensajes = [{
      role: 'assistant',
      content: '¡Chat reiniciado! 🔄 ¿En qué puedo ayudarte con tus trámites?',
      timestamp: new Date()
    }];
    localStorage.removeItem(this.STORAGE_KEY);
    this.cdr.detectChanges();
  }

  private guardarHistorial(): void {
    const data = this.mensajes.filter(m => !m.loading).map(m => ({
      role: m.role, content: m.content, timestamp: m.timestamp
    }));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private cargarHistorial(): void {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        this.mensajes = data.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch { this.mensajes = []; }
    }
  }

  private scrollAbajo(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }

  formatHora(date: Date): string {
    return new Date(date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }
}