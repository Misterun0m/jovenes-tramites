import { Injectable, NgZone } from '@angular/core';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

  private isInitialized = false;

  constructor(private zone: NgZone) {}

  initialize(clientId: string, callback: (response: any) => void): void {
    if (this.isInitialized) return;
    if (typeof google === 'undefined' || !google.accounts?.id) {
      console.error('Google SDK no cargado');
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => this.zone.run(() => callback(response))
    });

    this.isInitialized = true;
  }

  renderButton(elementId: string): void {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Elemento del botón no encontrado:', elementId);
      return;
    }

    google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      locale: 'es'
    });
  }
}