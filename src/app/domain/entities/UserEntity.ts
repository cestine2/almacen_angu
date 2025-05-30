import { RoleEntity } from "./RoleEntity";
import { SucursalEntity } from "./SucursalEntity";


// Refleja la estructura que devuelve tu App\Http\Resources\UserResource
export type UserEntity = {
  id: number;
  nombre: string; // Usamos 'nombre' basado en UserResource
  email: string;
  sucursal_id?: number; // El backend lo tiene en fillable, pero UserResource no lo devuelve directamente, sino el objeto sucursal
  role_id?: number;   // Similar para role_id
  estado: boolean;
  created_at?: string;
  updated_at?: string;

  // Relaciones cargadas
  sucursal?: SucursalEntity;
  roles?: RoleEntity; // Basado en UserResource que usa 'roles' como clave para un RolResource::make($this->whenLoaded('role'))
                      // Si el backend cambia esto a 'role' (singular) y es un solo objeto, ajusta aquí.
                      // O si 'roles' es un array de RoleEntity (si usa Spatie y devuelve la colección), ajusta a RoleEntity[]
  permissions?: { id: number; name: string }[]; // Basado en UserResource
}

// export type UserEntity = {
//     id: number;
//     nombre: string;
//     email: string;
//     sucursal?: SucursalEntity | null;
//     roles?: RoleEntity[];
//     estado: boolean;
//     created_at: string;
//     updated_at: string;
//     permissions?: string[];
// }

