export interface MaterialListFilters {
  status?: 'active' | 'all' | null;
  categoria_id?: number | null;
  proveedor_id?: number | null;
  cod_articulo?: string;
  nombre?: string;
  // No se menciona filtro por color_id en el endpoint del controller, pero sí en los campos del material.
  // Si se necesita, habría que añadirlo aquí y en el backend.
}