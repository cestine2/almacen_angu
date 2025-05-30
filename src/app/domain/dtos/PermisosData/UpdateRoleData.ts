export interface UpdateRoleData {
  name: string;
  guard_name?: string; // Aunque el backend no parece permitir actualizarlo vía UpdateRoleRequest
}