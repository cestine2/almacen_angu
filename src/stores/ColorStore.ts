import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { ColorEntity } from "../app/domain/entities/ColorEntity"

import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from "rxjs";
import { inject } from "@angular/core";
import { ColorService } from "../app/core/services/color.service";
import { MessageService } from "primeng/api";

type ColorState = {

 isOpenCreate: boolean;
 isOpenEdit: boolean;
 colors: ColorEntity[];
 colorEdit: ColorEntity | null; 

}

const initialState: ColorState = {
    isOpenCreate: false,
    isOpenEdit: false,
    colors: [],
    colorEdit: null

}

export const ColorStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    //todo lo que tengamos que hacer con acciones se difinen aqui
    //este metodo devuelve una funcion que va a dovelvoer el objeto -->
    withMethods((store, colorService = inject(ColorService), messageService = inject(MessageService)) => ({
        // Manejo de modales
      openModalCreate() {
        patchState(store, { isOpenCreate: true });
      },
      closeModalCreate() {
        patchState(store, { isOpenCreate: false });
      },
      openModalEdit(color: ColorEntity) {
        patchState(store, { isOpenEdit: true, colorEdit: color });
      },
      closeModalEdit() {
        patchState(store, { isOpenEdit: false, colorEdit: null });
      },
  
      // Operaciones CRUD
      doList() {
        colorService.list().subscribe({
          next: (response) => {
            patchState(store, { colors: response });
          },
          error: (error) => {
            console.error('Error loading colors:', error);
          }
        });
      },
    
      doCreate(colorData: { nombre: string; estado: boolean}) {
        // No retornes la suscripción aquí si solo la gestionas internamente
         colorService.create(colorData).subscribe({ // <-- Quita el 'return' si no necesitas que el componente se suscriba
            next: () => { // <-- Este es el bloque de ÉXITO
                this.doList(); // Recarga toda la lista
                patchState(store, { isOpenCreate: false });
                // <--- ¡Añade el toast de éxito aquí!
                messageService.add({severity:'success', summary:'Éxito', detail:'Color creado correctamente'});
            },
            error: (error) => {
                // El toast de error ya lo maneja el interceptor,
                // aquí solo logueas el error si quieres o haces otra cosa específica del store.
                console.error('Error en guardar desde Store:', error);
            }
        });
    },

      //---------------------------------------------------------------------
      doUpdate(id: number, colorData: Partial<ColorEntity>) {
        colorService.update(id, colorData).subscribe({
            next: () => {
                this.doList();
                patchState(store, { isOpenEdit: false, colorEdit: null });
                messageService.add({severity:'success', summary:'Actualización Exitosa', detail:'El color fue actualizado correctamente.'}); // Toast de éxito para update
            },
            error: (error) => {
                console.error('Error updating color:', error);
            }
        });
   },

    doDelete(id: number) {
        colorService.delete(id).subscribe({
            next: () => {
                this.doList();
                messageService.add({severity:'warn', summary:'Desactivacion exitosa', detail:'El color se desactivo.'}); // Toast de éxito para delete
            },
            error: (error) => {
                console.error('Error deleting color:', error);
            }
        });
    },

    doRestore(id: number) {
         colorService.restore(id).subscribe({
             next: () => {
                 this.doList();
                 messageService.add({severity:'success', summary:'Activacion exitosa', detail:'El color se activo.'}); // Toast de éxito para restore
             },
             error: (error) => {
                 console.error('Error restoring color:', error);
             }
         });
     }

    }))
);


