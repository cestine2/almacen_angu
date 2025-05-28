export interface ProveedorListFilters {
  status?: 'active' | 'all' | null; // 'null' para no enviar el filtro y que el backend decida
  nombre?: string;
}