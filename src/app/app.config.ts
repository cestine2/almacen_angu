import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { ConfirmationService, MessageService } from 'primeng/api';
import { errorInterceptor } from './core/interceptors/notification.interceptor';
import { AuthService } from './core/services/auth.service';
import { firstValueFrom } from 'rxjs';



export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })),
    MessageService,
    ConfirmationService,
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor ]),withFetch()),
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),

   
    provideAppInitializer(() => {
      const authService = inject(AuthService); // <-- Obtiene AuthService usando inject() aquí
    
      return firstValueFrom(authService.checkSession());
    }),
  ]};