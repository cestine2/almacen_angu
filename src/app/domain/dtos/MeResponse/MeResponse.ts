import { PermissionEntity } from "../../entities/PermissionEntity";
import { UserEntity } from "../../entities/UserEntity";


export interface MeResponse {
  data: UserEntity; // El objeto usuario tal como lo define UserEntity
  permissions: PermissionEntity[]; // Un array de objetos de permisos
  // Puedes añadir aquí otras propiedades si el endpoint /auth/me devuelve más cosas a este nivel raíz
}
