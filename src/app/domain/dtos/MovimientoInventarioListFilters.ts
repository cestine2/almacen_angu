export interface MovimientoInventarioListFilters {
  motivo?: 'entrada' | 'salida' | 'ajuste' | null;
  tipo?: 'Material' | 'Producto' | null;
  material_id?: number | null;
  producto_id?: number | null;
  sucursal_id?: number | null;
  start_date?: string | null; // Formato YYYY-MM-DD
  end_date?: string | null;   // Formato YYYY-MM-DD
  // usuario_id? : number | null; // Si se decide filtrar por usuario
}