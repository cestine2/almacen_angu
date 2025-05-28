export type CategoryEntity = {
    id: number
    nombre: string
    descripcion: string
    tipo: 'producto' | 'material'
    estado: boolean
  }