import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations'; // ✅ AGREGADO
import { routes } from './app.routes';

import {
  SocialLoginModule,
  SocialAuthServiceConfig,
  GoogleLoginProvider
} from '@abacritt/angularx-social-login';

export const appConfig: ApplicationConfig = {
  providers: [

    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(), // ✅ AGREGADO — necesario para @cardEntrance, @leftEntrance, @formStagger

    importProvidersFrom(SocialLoginModule),

    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '153731151960-js0nersgu9su6b36eq10ildhkmrfv22p.apps.googleusercontent.com'
            )
          }
        ],
        onError: (err: any) => console.error('SocialAuth Error', err)
      } as SocialAuthServiceConfig
    }

  ]
};
