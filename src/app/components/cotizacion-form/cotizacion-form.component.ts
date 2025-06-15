import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CotizacionService } from '../../services/cotizacion.service';
import { CotizacionResponse } from '../../models/cotizacion-response.model';
import { DetalleCotizacion } from '../../models/detalle-cotizacion.model';

@Component({
  selector: 'app-cotizacion-form',
  templateUrl: './cotizacion-form.component.html',
  styleUrls: ['./cotizacion-form.component.css']
})
export class CotizacionFormComponent implements OnInit {
  cotizacion: CotizacionResponse = {
    id: 0,
    numeroCotizacion: '',
    userNombre: '',
    userApellido: '',
    usuarioModificadorNombre: '',
    usuarioModificadorApellido: '',
    estado: 'PENDIENTE',
    fecha: new Date().toISOString().substring(0, 10),
    fechaCreacion: new Date().toISOString(),
    fechaModificacion: new Date().toISOString(),
    observaciones: '',
    subtotal: 0,
    igv: 0,
    total: 0,
    cliente: { id: 0, firstName: '', lastName:'', typeDocument: '',documentNumber: '', phoneNumber: '', email: '' },
    vehiculo: { id: 0, placa: '', marca: '', modelo: '', year: 0 },
    detalles: []
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cotizacionService: CotizacionService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cotizacionService.obtenerCotizacionPorId(+id).subscribe(res => {
        this.cotizacion = res;
      });
    }
  }

  guardar() {
    if (this.cotizacion.id) {
      this.cotizacionService.actualizarCotizacion(this.cotizacion.id, this.cotizacion).subscribe(() => {
        this.router.navigate(['/cotizaciones']);
      });
    } else {
      this.cotizacionService.crearCotizacion(this.cotizacion).subscribe(() => {
        this.router.navigate(['/cotizaciones']);
      });
    }
  }
}

