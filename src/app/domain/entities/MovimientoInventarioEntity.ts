import { MaterialEntity } from "./MaterialEntity";
import { ProductEntity } from "./ProductEntity";
import { SucursalEntity } from "./SucursalEntity";
import { UserEntity } from "./UserEntity";

export type MovimientoItem = MaterialEntity | ProductEntity; // Para item_asociado

export interface MovimientoInventarioEntity {
  id: number;
  motivo: 'entrada' | 'salida' | 'ajuste';
  descripcion: string | null;
  tipo: 'Material' | 'Producto';
  material_id: number | null;
  producto_id: number | null;
  cantidad: number;
  precio_unitario: number | null; // Es string en BD (decimal:2) pero number en JS
  total: number | null;          // Es string en BD (decimal:2) pero number en JS
  sucursal_id: number;
  usuario_id: number;
  created_at: string; // El backend lo devuelve como string

  // Relaciones cargadas
  sucursal?: SucursalEntity;
  usuario?: UserEntity;
  material?: MaterialEntity;
  producto?: ProductEntity;
  item_asociado?: MovimientoItem | null; // Propiedad del Resource
}