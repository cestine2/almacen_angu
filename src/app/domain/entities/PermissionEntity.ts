export type PermissionEntity = {
  id: number;
  name: string; // El nombre del permiso (ej. 'manage-users')
  description?: string | null; // La descripción que viene del PermissionController
}