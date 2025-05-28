import { CategoryEntity } from "./CategoryEntity";
import { ColorEntity } from "./ColorEntity";
import { ProveedorEntity } from "./ProveedorEntity";

export type MaterialEntity = {
    id: number;
    cod_articulo: string;
    nombre: string;
    descripcion: string | null;
    categoria_id: number;
    proveedor_id: number;
    codigo_barras: string | null;
    color_id: number;
    estado: boolean;
    // created_at?: string;
    // updated_at?: string;

    // Relaciones cargadas
    categoria?: CategoryEntity;
    proveedor?: ProveedorEntity;
    color?: ColorEntity;
}