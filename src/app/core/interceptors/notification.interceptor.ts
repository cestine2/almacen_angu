import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core'; // Necesario para inyectar servicios en interceptores funcionales
import { MessageService } from 'primeng/api'; // <-- Importa el MessageService de PrimeNG

// Define el interceptor funcional
export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {

  // Inyecta el MessageService dentro del contexto del interceptor funcional
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => { // Captura los errores HTTP

      console.error('Intercepted Error (PrimeNG):', error); // Opcional: loguea el error

      let errorMessage = 'Ha ocurrido un error inesperado.';
      let summary = 'Error del Sistema';

      // Verifica si el error es una respuesta HTTP y tiene estado
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente o de red
        errorMessage = `Error: ${error.error.message}`;
        summary = 'Error de Cliente/Red';
      } else {
        // Error del lado del servidor (respuestas con estado 4xx o 5xx)
        switch (error.status) {
          case 400:
            summary = 'Solicitud Inválida';
            // Intenta usar un mensaje del backend si está disponible, si no, un mensaje genérico
            errorMessage = error.error?.message || 'Los datos enviados son incorrectos.';
            break;
          case 401: // Ejemplo adicional: No autorizado
             summary = 'Credenciales invalidas';
             errorMessage = error.error?.message || 'Correo o contraseña invalidos.';
             // Aquí podrías añadir lógica para redirigir al login
             break;
          case 404: // Ejemplo adicional: No encontrado
              summary = 'No Encontrado';
              errorMessage = error.error?.message || 'El recurso solicitado no existe.';
              break;
          case 409:
            summary = 'Conflicto';
            // Intenta usar un mensaje del backend si está disponible
            errorMessage = error.error?.message || 'Ocurrió un problema en el servidor.';
            break;
          case 422: // <--- Añadido: Error de Validación
              summary = 'Error de Validación';
              // El backend a menudo envía detalles de validación en el cuerpo del error.
              // Puedes necesitar formatear error.error si es un objeto complejo (ej: Laravel Validation Errors)
              // Aquí usamos un mensaje genérico o el del backend si existe.
              errorMessage = error.error?.message || 'Los datos proporcionados no son válidos.';

              break;
          case 500:
            summary = 'Error Interno del Servidor';
            // Intenta usar un mensaje del backend si está disponible
            errorMessage = error.error?.message || 'Ocurrió un problema en el servidor.';
            break;
            
          default:
             // Para otros códigos de error que no manejamos explícitamente
             summary = `Error HTTP ${error.status}`;
             errorMessage = error.error?.message || error.statusText || 'Error desconocido del servidor.';
             break;
        }
       
      }

      // Muestra el toast de error usando MessageService de PrimeNG
      messageService.add({ severity: 'error', summary: summary, detail: errorMessage });

      // Es crucial relanzar el error para que pueda ser manejado por el código que hizo la petición original
      return throwError(() => error);
    })
  );
};