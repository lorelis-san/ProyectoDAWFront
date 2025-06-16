export interface CotizacionDto {
  clienteId: number;
  vehiculoId: number;
  observaciones: string;
  detalles: {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
  }[];
}
