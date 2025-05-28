export interface InventarioListFilters {
  status?: 'active' | 'all' | null;
  tipo?: 'Material' | 'Producto' | null; // Null para no filtrar por tipo específico
  material_id?: number | null;
  producto_id?: number | null;
  sucursal_id?: number | null;
  // No incluimos 'nombre' aquí porque el backend no lo soporta directamente en la tabla de inventario.
  // Si el backend lo añade, lo agregaríamos aquí.
}