import {
  Component, OnInit, AfterViewInit, OnDestroy, NgZone, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { TramitesService, Modulo, ModulosResponse } from '../../services/tramites.service_maps';
import { ChatFlotanteComponent } from '../../components/chat_flotante/chat-flotante.componet';

declare const google: any;

const GOOGLE_MAPS_API_KEY = 'AIzaSyAwIcOEpRj6SDvrHD4IZIw7eEwwkT1j6XY';

@Component({
  selector:    'app-mapa-tramites',
  standalone:  true,
  imports:     [CommonModule, HttpClientModule, ChatFlotanteComponent],
  providers:   [TramitesService],
  templateUrl: './mapa-tramites.html',
  styleUrl:    './mapa-tramites.css'
})
export class MapaTramitesComponent implements OnInit, AfterViewInit, OnDestroy {

  private map!:          any;
  private marcadores:    any[] = [];
  private marcadorUser?: any;
  private infoWindow?:   any;
  private lineaRuta?:    any;

  tramId             = 0;
  tramiteLabel       = 'Trámite';
  modulosFiltrados:  Modulo[] = [];
  moduloSeleccionado?: Modulo;

  cargandoModulos    = false;
  cargandoUbicacion  = false;
  errorUbicacion:    string | null = null;
  ubicacionObtenida  = false;
  userLat?:          number;
  userLng?:          number;

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private svc:    TramitesService,
    private zone:   NgZone,
    private cdr:    ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tramId       = parseInt(params['tram_id'], 10) || 0;
      this.tramiteLabel = params['tram_tip'] ?? 'Trámite';
    });
  }

  ngAfterViewInit(): void {
    this.cargarScriptGoogleMaps().then(() => {
      this.initMap();
      this.solicitarUbicacion();
    });
  }

  ngOnDestroy(): void {
    this.marcadores.forEach(m => m.setMap(null));
  }

  // ── Carga el script de Google Maps dinámicamente ──────────
  private cargarScriptGoogleMaps(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof google !== 'undefined' && google.maps) {
        resolve();
        return;
      }
      const script    = document.createElement('script');
      script.src      = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async    = true;
      script.defer    = true;
      script.onload   = () => resolve();
      document.head.appendChild(script);
    });
  }

  // ── Inicializa el mapa centrado en CDMX ──────────────────
  private initMap(): void {
    const el = document.getElementById('google-map')!;
    this.map = new google.maps.Map(el, {
      center:            { lat: 19.4326, lng: -99.1332 },
      zoom:              12,
      disableDefaultUI:  false,
      mapTypeControl:    false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
      ]
    });
    this.infoWindow = new google.maps.InfoWindow();
  }

  // ── Solicita geolocalización al usuario ──────────────────
  solicitarUbicacion(): void {
    if (!navigator.geolocation) {
      this.errorUbicacion = 'Tu navegador no soporta geolocalización.';
      this.cargarSinUbicacion();
      this.cdr.detectChanges();
      return;
    }

    this.cargandoUbicacion = true;
    this.errorUbicacion    = null;
    this.cdr.detectChanges();

    // Timeout manual por si el usuario no responde el popup
    const timeoutId = setTimeout(() => {
      this.zone.run(() => {
        this.cargandoUbicacion = false;
        this.errorUbicacion    = 'Tiempo agotado. Mostrando todos los módulos.';
        this.cargarSinUbicacion();
        this.cdr.detectChanges();
      });
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      pos => {
        clearTimeout(timeoutId);
        this.zone.run(() => this.onUbicacion(pos));
      },
      err => {
        clearTimeout(timeoutId);
        this.zone.run(() => this.onErrorUbicacion(err));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }

  private onUbicacion(pos: GeolocationPosition): void {
    this.userLat           = pos.coords.latitude;
    this.userLng           = pos.coords.longitude;
    this.cargandoUbicacion = false;
    this.ubicacionObtenida = true;

    // Marcador azul del usuario
    if (this.marcadorUser) this.marcadorUser.setMap(null);
    this.marcadorUser = new google.maps.Marker({
      position: { lat: this.userLat!, lng: this.userLng! },
      map:      this.map,
      title:    'Tu ubicación',
      icon: {
        path:         google.maps.SymbolPath.CIRCLE,
        scale:        10,
        fillColor:    '#4f46e5',
        fillOpacity:  1,
        strokeColor:  '#ffffff',
        strokeWeight: 3
      },
      zIndex: 999
    });

    // Círculo de precisión
    new google.maps.Circle({
      map:          this.map,
      center:       { lat: this.userLat!, lng: this.userLng! },
      radius:       pos.coords.accuracy,
      fillColor:    '#818cf8',
      fillOpacity:  0.15,
      strokeColor:  '#6366f1',
      strokeWeight: 1
    });

    this.map.panTo({ lat: this.userLat!, lng: this.userLng! });
    this.map.setZoom(13);
    this.cargarModulos();
  }

  private onErrorUbicacion(err: GeolocationPositionError): void {
    this.cargandoUbicacion = false;
    console.error('❌ Error geolocalización:', err.code, err.message);
    const msgs: Record<number, string> = {
      1: 'Permiso denegado. Puedes ver todos los módulos.',
      2: 'No se pudo determinar tu posición.',
      3: 'Tiempo agotado para obtener la ubicación.'
    };
    this.errorUbicacion = msgs[err.code] ?? 'Error de geolocalización.';
    this.cargarSinUbicacion();
    this.cdr.detectChanges();
  }

  cargarSinUbicacion(): void {
    this.errorUbicacion    = null;
    this.ubicacionObtenida = false;
    this.userLat           = undefined;
    this.userLng           = undefined;
    this.cargarModulos();
  }

  // ── Carga módulos desde la API ────────────────────────────
  cargarModulos(): void {
    if (this.tramId <= 0) {
      console.warn('⚠️ tramId inválido:', this.tramId);
      return;
    }
    console.log('📡 Llamando API con tramId:', this.tramId, 'lat:', this.userLat, 'lng:', this.userLng);
    this.cargandoModulos = true;
    this.cdr.detectChanges();

    this.svc.getModulos(this.tramId, this.userLat, this.userLng).pipe(
      map((resp: ModulosResponse) => resp.modulos)
    ).subscribe({
      next: (modulos) => {
        console.log('✅ Módulos recibidos:', modulos);
        this.modulosFiltrados = modulos;
        this.cargandoModulos  = false;
        this.renderizarMarcadores();
        if (modulos.length > 0) this.seleccionarModulo(modulos[0]);
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.error('❌ Error cargando módulos:', e);
        this.cargandoModulos = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Dibuja marcadores en el mapa ──────────────────────────
  private renderizarMarcadores(): void {
    this.marcadores.forEach(m => m.setMap(null));
    this.marcadores = [];

    const bounds = new google.maps.LatLngBounds();
    if (this.userLat && this.userLng) {
      bounds.extend({ lat: this.userLat, lng: this.userLng });
    }

    this.modulosFiltrados.forEach((modulo, i) => {
      const esCercano = i === 0 && this.ubicacionObtenida;

      const marker = new google.maps.Marker({
        position: { lat: modulo.lat, lng: modulo.lng },
        map:      this.map,
        title:    modulo.nombre,
        label: {
          text:       String(i + 1),
          color:      'white',
          fontWeight: 'bold',
          fontSize:   '13px'
        },
        icon: {
          path:         google.maps.SymbolPath.CIRCLE,
          scale:        18,
          fillColor:    esCercano ? '#16a34a' : '#7c3aed',
          fillOpacity:  1,
          strokeColor:  '#ffffff',
          strokeWeight: 2
        },
        zIndex: esCercano ? 10 : 5
      });

      marker.addListener('click', () => {
        this.zone.run(() => this.seleccionarModulo(modulo));
      });

      this.marcadores.push(marker);

      // Solo agrega al bounds los 3 más cercanos
      if (i < 3) {
        bounds.extend({ lat: modulo.lat, lng: modulo.lng });
      }
    });

    if (this.modulosFiltrados.length > 0) {
      if (this.ubicacionObtenida) {
        // Con ubicación: centra en el más cercano con zoom 12
        this.map.setCenter({
          lat: this.modulosFiltrados[0].lat,
          lng: this.modulosFiltrados[0].lng
        });
        this.map.setZoom(12);
      } else {
        // Sin ubicación: ajusta bounds de los primeros 3
        this.map.fitBounds(bounds, { padding: 60 });
      }
    }
  }

  // ── Selecciona un módulo ──────────────────────────────────
  seleccionarModulo(modulo: Modulo): void {
    this.moduloSeleccionado = modulo;

    this.modulosFiltrados.forEach((m, i) => {
      const marker    = this.marcadores[i];
      const esCercano = i === 0 && this.ubicacionObtenida;
      const selec     = m.modulo_id === modulo.modulo_id;
      if (!marker) return;
      marker.setIcon({
        path:         google.maps.SymbolPath.CIRCLE,
        scale:        selec ? 22 : 18,
        fillColor:    selec ? '#7c3aed' : (esCercano ? '#16a34a' : '#9ca3af'),
        fillOpacity:  1,
        strokeColor:  selec ? '#c4b5fd' : '#ffffff',
        strokeWeight: selec ? 3 : 2
      });
      marker.setZIndex(selec ? 20 : 5);
    });

    const idx = this.modulosFiltrados.indexOf(modulo);
    if (idx >= 0 && this.marcadores[idx]) {
      const dist = modulo.distancia_km != null
        ? `<p style="margin:2px 0;color:#7c3aed;font-size:.8rem">📏 ${this.formatDist(modulo.distancia_km)}</p>`
        : '';
      this.infoWindow.setContent(`
        <div style="font-family:sans-serif;min-width:160px;padding:4px">
          <b style="color:#7c3aed">${modulo.nombre}</b>
          <p style="margin:4px 0;font-size:.78rem;color:#374151">${modulo.direccion}</p>
          <p style="margin:2px 0;font-size:.78rem">🕐 ${modulo.horario}</p>
          ${dist}
        </div>
      `);
      this.infoWindow.open(this.map, this.marcadores[idx]);
      this.map.panTo({ lat: modulo.lat, lng: modulo.lng });
    }

    // Línea desde usuario al módulo seleccionado
    if (this.lineaRuta) this.lineaRuta.setMap(null);
    if (this.userLat && this.userLng) {
      this.lineaRuta = new google.maps.Polyline({
        path: [
          { lat: this.userLat, lng: this.userLng },
          { lat: modulo.lat,   lng: modulo.lng   }
        ],
        geodesic:      true,
        strokeColor:   '#7c3aed',
        strokeOpacity: 0.7,
        strokeWeight:  3,
        icons: [{
          icon:   { path: google.maps.SymbolPath.FORWARD_OPEN_ARROW },
          offset: '50%'
        }]
      });
      this.lineaRuta.setMap(this.map);
    }

    this.cdr.detectChanges();
  }

  formatDist(km?: number | null): string {
    if (km == null) return '';
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
  }

  irAtras(): void {
    this.router.navigate(['/requisitos-tramites'], {
      queryParams: {
        tram_id:  this.tramId,
        tram_tip: this.tramiteLabel
      }
    });
  }

  irSiguiente(): void {
    const modulo = this.moduloSeleccionado ?? this.modulosFiltrados[0];
    if (!modulo) return;
    this.router.navigate(['/exito-tramites'], {
      queryParams: {
        tram_id:   this.tramId,
        tram_tip:  this.tramiteLabel,
        modulo_id: modulo.modulo_id,
        nombre:    modulo.nombre
      }
    });
  }
}