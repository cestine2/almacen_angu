import { Component, inject } from '@angular/core';
import { PasswordModule } from 'primeng/password';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStore } from '../../../../stores/AuthStore';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  imports: [PasswordModule, FormsModule, ButtonModule, ReactiveFormsModule, CardModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent{

  showPassword: boolean = false;
  frmLogin: FormGroup;
  // email: string = '';
  // password: string = '';
  // errorMessage: string = '';

  router = inject(Router);
  authService = inject(AuthService);
  authStore = inject(AuthStore);

  public readonly isLoading = this.authStore.isLoading;
  public readonly errorMessage = this.authStore.error;

  constructor(
    private fb: FormBuilder,
    

  ){
    this.frmLogin = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]), // Añade Validators.email
      password: new FormControl('', [Validators.required, Validators.minLength(8)]), // Añade Validators.minLength(8)

    });
    // *** MEJORA: Limpiar el mensaje de error del store cuando el formulario cambia ***
    // Suscribirse a los cambios de valor del formulario para limpiar el error.
    // Esto limpia el error tan pronto como el usuario empieza a escribir después de un fallo.
    this.frmLogin.valueChanges.subscribe(() => {
      if (this.authStore.error()) { // Solo limpia si hay un error visible actualmente
        this.authStore.setError(null);
      }
    });
  }

  onSubmit(): void {
    // Marca todos los controles como tocados para mostrar errores de validación
    this.frmLogin.markAllAsTouched();
    this.authStore.setError(null);
    // Verifica si el formulario es válido
    if (this.frmLogin.valid) {
      // Si es válido, obtiene las credenciales del formulario
      const credentials = this.frmLogin.value;

      // Llama al método login del AuthService
      // El AuthService maneja la lógica de la API, la actualización del store,
      // la persistencia en localStorage y la navegación en caso de éxito.
      this.authService.login(credentials).subscribe({
        // No necesitas manejar el 'next' aquí si el servicio ya navega en éxito
        // next: (user) => {
        //   console.log('Login successful', user);
        //   // La navegación ya se maneja en el AuthService
        // },
        error: (err) => {
          // El catchError en el AuthService ya setea el mensaje de error en el store.
          // Aquí podrías hacer algo adicional si fuera necesario,
          // pero el mensaje ya estará disponible a través de la señal errorMessage.
          console.error('Login failed in component:', err);
        }
      });

    } else {
      // Si el formulario no es válido, puedes setear un mensaje de error genérico localmente
      // o confiar solo en los mensajes de validación del formulario y los errores del backend.
      // Si quieres un mensaje genérico, puedes setear la señal de error del store o una propiedad local.
      // Usaremos la señal del store para ser consistentes.
      //  this.authStore.setError('Porf.'); // Usa el método del store para setear error
       console.warn('Formulario de login inválido. No se envió la petición.');
    }

  }
}
