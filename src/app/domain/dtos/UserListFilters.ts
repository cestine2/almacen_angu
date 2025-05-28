export interface UserListFilters {
  status?: 'active' | 'all' | 'inactive' | null; // Añadido 'inactive' si el backend lo soporta
  nombre?: string;
}