import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CotizacionService } from '../../services/cotizacion.service';
import { CotizacionResponse } from '../../models/cotizacion-response.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DetalleCotizacion } from '../../models/detalle-cotizacion.model';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ClientService } from '../../services/client.service';
import { VehicleService } from '../../services/vehicle.service';
import { ChangeDetectorRef } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { CotizacionDto } from '../../models/CotizacionDTO.model.';
import { AlertService } from '../../services/alert.service';
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
    cliente: { id: 0, firstName: '', lastName: '', typeDocument: '', businessName: '', documentNumber: '', phoneNumber: '', email: '' },
    vehiculo: { id: 0, placa: '', marca: '', modelo: '', year: '' },
    detalles: []
  };

  clienteEncontrado: boolean | null = null;
  busquedaRealizada: boolean = false;
  vehiculoEncontrado: boolean | null = null;
  busquedaVehiculoRealizada: boolean = false;
  typeDocument: string[] = ['RUC', 'DNI'];
  busquedaProducto: string = '';
  isEdit = false;
  productosFiltrados: Product[] = [];
  idCotizacion: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cotizacionService: CotizacionService,
    private productService: ProductService,
    private clientService: ClientService,
    private vehicleService: VehicleService,
    private cdRef: ChangeDetectorRef,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idCotizacion = +id;
      this.isEdit = true;

      this.cotizacionService.obtenerCotizacionPorId(+id).subscribe({
        next: (res) => {

          this.cotizacion = { ...res.data };

          if (!this.cotizacion.detalles) {
            this.cotizacion.detalles = [];
          }

          this.actualizarTotales();
          this.cdRef.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar cotización:', err);
        }
      });
    }
  }

  guardar() {

    if (!this.cotizacion.detalles || this.cotizacion.detalles.length === 0) {
      this.alertService.error('Debe agregar al menos un producto a la cotización', '');
      return;
    }

    if (!this.cotizacion.cliente?.id || !this.cotizacion.vehiculo?.id) {
      this.alertService.error('Complete todos los campos', 'Debe seleccionar un cliente y un vehículo');
      return;
    }

    const dto = this.convertirACotizacionDTO();
    if (this.isEdit && this.idCotizacion !== null) {
      this.actualizarTotales();
      this.cotizacionService.actualizarCotizacion(this.idCotizacion, dto).subscribe({
        next: (res) => {
          this.alertService.success('Cotización actualizada', 'La cotización fue actualizada con éxito');
          this.router.navigate(['/cotizaciones']);
        },
        error: (err) => {
          this.alertService.error('Error al actualizar cotización: ', err + (err.error?.message || err.message));
        }
      });
    } else {
      this.cotizacionService.crearCotizacion(dto).subscribe({
        next: (res) => {
          this.alertService.success('Cotización creada ', 'La cotización fue creada con éxito');
          this.router.navigate(['/cotizaciones']);
        },
        error: (err) => {
          console.error('Error al crear cotización:', err);
          this.alertService.error('Error al crear cotización: ', err + (err.error?.message || err.message));
        }
      });
    }
  }


  convertirACotizacionDTO(): CotizacionDto {
    const dto = {
      clienteId: this.cotizacion.cliente!.id!,
      vehiculoId: this.cotizacion.vehiculo!.id!,
      observaciones: this.cotizacion.observaciones!,
      detalles: this.cotizacion.detalles
        .filter(det => det.cantidad > 0)
        .map(det => ({
          productoId: det.productoId!,
          cantidad: det.cantidad,
          precioUnitario: det.precioUnitario
        }))
    };

    return dto;
  }

  buscarProducto() {
    const termino = this.busquedaProducto.trim();

    if (termino.length >= 2) {
      this.productService.search(termino).subscribe({
        next: (response) => {
          this.productosFiltrados = response.data;
        },
        error: (err) => {
          this.productosFiltrados = [];
        }
      });
    } else {
      this.productosFiltrados = [];
    }
  }

  agregarProducto(producto: Product) {
    if (producto.id == null) {
      return;
    }

    const existente = this.cotizacion.detalles.find(d => d.productoId === producto.id);

    if (existente) {
      existente.cantidad += 1;
      existente.subtotal = existente.cantidad * existente.precioUnitario;
    } else {
      const nuevoDetalle: DetalleCotizacion = {
        productoId: producto.id,
        nombreProducto: producto.name,
        cantidad: 1,
        precioUnitario: producto.salePrice!,
        subtotal: producto.salePrice!
      };

      this.cotizacion.detalles = [...this.cotizacion.detalles, nuevoDetalle];
    }

    this.actualizarTotales();
    this.busquedaProducto = '';
    this.productosFiltrados = [];
    this.cdRef.detectChanges();
  }

  actualizarCantidad(detalle: DetalleCotizacion, nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) {
      this.eliminarProducto(detalle);
      return;
    }
    const index = this.cotizacion.detalles.findIndex(d => d.productoId === detalle.productoId);
    if (index !== -1) {
      this.cotizacion.detalles[index] = {
        ...this.cotizacion.detalles[index],
        cantidad: nuevaCantidad,
        subtotal: nuevaCantidad * this.cotizacion.detalles[index].precioUnitario
      };
      this.cotizacion.detalles = [...this.cotizacion.detalles];

      this.actualizarTotales();
      this.cdRef.detectChanges();
    }
  }

  actualizarTotales() {
    const detallesValidos = this.cotizacion.detalles.filter(d => d.cantidad > 0);

    detallesValidos.forEach(detalle => {
      detalle.subtotal = detalle.precioUnitario * detalle.cantidad;
    });

    const subtotal = detallesValidos.reduce((acc, d) => acc + d.subtotal, 0);
    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    this.cotizacion.subtotal = Math.round(subtotal * 100) / 100;
    this.cotizacion.igv = Math.round(igv * 100) / 100;
    this.cotizacion.total = Math.round(total * 100) / 100;


  }

  eliminarProducto(detalleAEliminar: DetalleCotizacion): void {
    this.alertService.confirmDelete(detalleAEliminar.nombreProducto).then(confirmado => {
      if (confirmado) {
        this.cotizacion.detalles = this.cotizacion.detalles.filter(
          (detalle) => detalle.productoId !== detalleAEliminar.productoId
        );

        this.actualizarTotales();
        this.cdRef.detectChanges();

        this.alertService.success('Producto eliminado', `"${detalleAEliminar.nombreProducto}" fue eliminado correctamente.`);
      }
    });
  }

  limpiarDetallesVacios(): void {
    const detallesOriginales = this.cotizacion.detalles.length;

    this.cotizacion.detalles = this.cotizacion.detalles.filter(d => d.cantidad > 0);

    const detallesEliminados = detallesOriginales - this.cotizacion.detalles.length;

    if (detallesEliminados > 0) {
      this.actualizarTotales();
      this.cdRef.detectChanges();
    }
  }

  buscarClientePorDocumento(): void {
  const documento = this.cotizacion.cliente?.documentNumber;
  if (!documento) return;

  this.clientService.searchByDocument(documento).subscribe(
    (response) => {
      this.cotizacion.cliente = response.data;
      this.cotizacion.cliente!.typeDocument = this.cotizacion.cliente?.typeDocument || '';
      this.clienteEncontrado = true;
      this.busquedaRealizada = true;
      this.cdRef.detectChanges();

      this.alertService.success('Cliente encontrado', 'Los datos del cliente han sido cargados.');
    },
    (error) => {
     
      this.clienteEncontrado = false;
      this.busquedaRealizada = true;
      this.cotizacion.cliente = {
        typeDocument: this.cotizacion.cliente?.typeDocument || '',
        documentNumber: documento,
        firstName: '',
        lastName: '',
        businessName: '',
        email: '',
        phoneNumber: ''
      };

      this.alertService.warning('Cliente no encontrado', 'Puede registrar uno nuevo.');
    }
  );
}


  guardarCliente() {
    this.clientService.create(this.cotizacion.cliente!).subscribe({
      next: (response) => {
        console.log('Cliente guardado', response);
        this.cotizacion.cliente = response.data;
        this.clienteEncontrado = true;

        this.alertService.success('Cliente guardado', 'El cliente ha sido registrado correctamente.');

        const modal = document.getElementById('modalAgregarCliente');
        if (modal) {
          const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
          modalInstance?.hide();

          setTimeout(() => {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();

            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
          }, 300);
        }
      },
      error: (err) => {
        this.alertService.error('Error al guardar cliente', err);
      }
    });
  }

  buscarVehiculoPorPlaca(): void {
  const placa = this.cotizacion.vehiculo?.placa;
  if (!placa) return;

  this.vehicleService.getByPlaca(placa).subscribe(
    (response) => {
      this.cotizacion.vehiculo = response.data;
      this.vehiculoEncontrado = true;
      this.busquedaVehiculoRealizada = true;

      this.alertService.success('Vehículo encontrado', `Se ha cargado el vehículo con placa ${placa}.`);
    },
    (error) => {
      this.vehiculoEncontrado = false;
      this.busquedaVehiculoRealizada = true;
      this.cotizacion.vehiculo = {
        placa: placa,
        marca: '',
        modelo: '',
        year: ''
      };

      this.alertService.warning('Vehículo no encontrado', `No se encontró ningún vehículo con la placa ${placa}. Puede registrar uno nuevo.`);
    }
  );
}

  guardarVehiculo() {
    this.vehicleService.create(this.cotizacion.vehiculo!).subscribe({
      next: (response) => {
        console.log('Vehículo guardado', response);
        this.cotizacion.vehiculo = response.data;
        this.vehiculoEncontrado = true;

        this.alertService.success('Vehículo guardado', 'El vehículo ha sido registrado correctamente.');

        const modal = document.getElementById('modalAgregarVehículo');
        if (modal) {
          const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
          modalInstance.hide();

          setTimeout(() => {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();

            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
          }, 300);
        }
      },
      error: (err) => {
        this.alertService.error('Error al guardar vehículo', err);
      }
    });
  }

}


