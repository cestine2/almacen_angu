import { CategoryEntity } from "./CategoryEntity";
import { ColorEntity } from "./ColorEntity";
import { SucursalEntity } from "./SucursalEntity";

export type ProductEntity = {
    id: number;
    nombre: string;
    descripcion: string | null; // Puede ser nullable
    categoria_id: number;
    talla: string;
    color_id: number;
    precio: number; // El backend lo castea a decimal, en TS lo manejamos como number
    codigo_barras: string | null; // Puede ser nullable
//     sucursal_id: number;
    estado: boolean;
//     created_at: string; // O Date si prefieres parsear
//     updated_at: string; // O Date si prefieres parsear

    // Relaciones cargadas (cuando se incluyen con `->with(...)`)
    categoria?: CategoryEntity;
    color?: ColorEntity;
//     sucursal?: SucursalEntity;
}