export interface ProductListFilters {
    status?: 'active' | 'all'; // Mapeado a 'estado' en el backend
    categoria_id?: number | null; // Puede ser null para "todas"
//     sucursal_id?: number | null; // Puede ser null para "todas"
    nombre?: string;
    talla?: string;
}