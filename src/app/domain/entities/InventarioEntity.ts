import { MaterialEntity } from "./MaterialEntity";
import { ProductEntity } from "./ProductEntity";
import { SucursalEntity } from "./SucursalEntity";
import { UserEntity } from "./UserEntity";

export type InventarioItem = MaterialEntity | ProductEntity; // Tipo unión para el ítem

export type InventarioEntity = {
  id: number
  tipo: 'Material' | 'Producto'
  material_id: number | null
  producto_id: number | null
  stock_actual: number
  sucursal_id: number
  usuario_id: number // Asignado por el backend
  estado: boolean
//   created_at?: string
//   updated_at?: string

  // Relaciones cargadas
  sucursal?: SucursalEntity;
  usuario?: UserEntity;
  material?: MaterialEntity; // Se carga si tipo es 'Material'
  producto?: ProductEntity; // Se carga si tipo es 'Producto'

  // Propiedad 'item' que tu InventarioResource añade (muy útil)
  item?: InventarioItem | null;
}