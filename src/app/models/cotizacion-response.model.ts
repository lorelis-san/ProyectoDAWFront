import { Client } from './client.model';
import { Vehicle } from './vehicle.model';
import { DetalleCotizacion } from './detalle-cotizacion.model';

export interface CotizacionResponse {
  id?: number;
  numeroCotizacion?: string;
  userNombre?: string;
  userApellido?: string;
  usuarioModificadorNombre?: string;
  usuarioModificadorApellido?: string;
  estado?: string;
  fecha?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  observaciones?: string;
  subtotal?: number;
  igv?: number;
  total?: number;
  cliente?: Client;
  vehiculo?: Vehicle;
  detalles: DetalleCotizacion[];
}
