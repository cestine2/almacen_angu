export type MoveEntity = {
    id: number
    movimiento: string
    tipo: string
    material_id?: number
    producto_id?: number
    cantidad: number
    sucursal_id: number
    fecha: Date
    item_nombre: string
    sucursal_nombre: string
  }