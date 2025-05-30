export interface CreateRoleData {
  name: string;
  guard_name?: string; // Opcional, el backend lo pone a 'api' por defecto
}