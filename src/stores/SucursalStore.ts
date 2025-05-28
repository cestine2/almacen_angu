import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";

import { inject } from "@angular/core";

import { MessageService } from "primeng/api"; // Para los toasts
import { Subscription } from 'rxjs'; // Para manejar suscripciones si es necesario
import { SucursalEntity } from "../app/domain/entities/SucursalEntity";
import { SucursalService } from "../app/core/services/sucursal.service";

type SucursalState = {
  isOpenCreate: boolean;
  isOpenEdit: boolean;
  sucursales: SucursalEntity[]; // Cambié 'sucursal' a 'sucursales' para la lista
  sucursalEdit: SucursalEntity | null; // Cambié a un solo objeto para edición, no un array
}

const initialState: SucursalState = {
    isOpenCreate: false,
    isOpenEdit: false,
    sucursales: [],
    sucursalEdit: null
}

export const SucursalStore = signalStore(
    { providedIn: 'root' }, // Para que sea un singleton en toda la aplicación
    withState(initialState),
    withMethods((store,
        sucursalService = inject(SucursalService),
        messageService = inject(MessageService)
    ) => ({
        // Métodos para el manejo de modales
        openModalCreate() {
            patchState(store, { isOpenCreate: true });
        },
        closeModalCreate() {
            patchState(store, { isOpenCreate: false });
        },
        openModalEdit(sucursal: SucursalEntity) { // Recibe el objeto SucursalEntity a editar
            patchState(store, { isOpenEdit: true, sucursalEdit: sucursal });
        },
        closeModalEdit() {
            patchState(store, { isOpenEdit: false, sucursalEdit: null });
        },

        // Operaciones CRUD
        doList() {
            sucursalService.list().subscribe({
                next: (response) => {
                    patchState(store, { sucursales: response });
                    // No toast de éxito para la lista, solo la carga
                },
                error: (error) => {
                    console.error('Error al cargar sucursales:', error);
                    // El interceptor ya muestra el toast de error HTTP
                }
            });
        },

        doCreate(sucursalData: { nombre: string; direccion: string; estado: boolean }) {
            sucursalService.create(sucursalData).subscribe({
                next: (response) => {
                    // Actualiza la lista recargándola (o puedes añadir el elemento localmente)
                    this.doList();
                    patchState(store, { isOpenCreate: false });
                    messageService.add({severity:'success', summary:'Éxito', detail:`Sucursal creada correctamente`});
                },
                error: (error) => {
                    console.error('Error al crear sucursal:', error);
                    // El interceptor ya muestra el toast de error HTTP
                }
            });
        },

        doUpdate(id: number, sucursalData: Partial<SucursalEntity>) {
            sucursalService.update(id, sucursalData).subscribe({
                next: (response) => {
                    this.doList(); // Recarga la lista para ver los cambios
                    patchState(store, { isOpenEdit: false, sucursalEdit: null });
                    messageService.add({severity:'success', summary:'Actualización Exitosa', detail:`Sucursal '${response.nombre}' actualizada correctamente`});
                },
                error: (error) => {
                    console.error('Error al actualizar sucursal:', error);
                    // El interceptor ya muestra el toast de error HTTP
                }
            });
        },

        doDelete(id: number) {
            sucursalService.delete(id).subscribe({
                next: () => {
                    this.doList(); // Recarga la lista para ver los cambios (la sucursal ahora debería estar inactiva)
                    messageService.add({severity:'warn', summary:'Desactivacion exitosa', detail:'El color se desactivo.'});
                },
                error: (error) => {
                    console.error('Error al eliminar sucursal:', error);
                    // El interceptor ya muestra el toast de error HTTP
                }
            });
        },

        doRestore(id: number) {
            sucursalService.restore(id).subscribe({
                next: () => {
                    this.doList(); // Recarga la lista para ver los cambios (la sucursal ahora debería estar activa)
                    messageService.add({severity:'success', summary:'Restauración Exitosa', detail: 'Sucursal restaurada con éxito'});
                },
                error: (error) => {
                    console.error('Error al restaurar sucursal:', error);
                    // El interceptor ya muestra el toast de error HTTP
                }
            });
        }

    }))
);