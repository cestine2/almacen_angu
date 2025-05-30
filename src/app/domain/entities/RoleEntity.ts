import { PermissionEntity } from './PermissionEntity';

export type RoleEntity = {
  id: number;
  name: string;
  guard_name?: string; // Usualmente 'api' o 'web'
  permissions?: PermissionEntity[]; // Array de permisos asociados a este rol
  created_at?: string;
  updated_at?: string;
}