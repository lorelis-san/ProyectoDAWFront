import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CotizacionService } from '../../services/cotizacion.service';
import { CotizacionResponse } from '../../models/cotizacion-response.model';
import { DetalleCotizacion } from '../../models/detalle-cotizacion.model';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ClientService } from '../../services/client.service';
import { VehicleService } from '../../services/vehicle.service';
import { Client } from '../../models/client.model';
import { CotizacionDto } from '../../models/CotizacionDTO.model.';
import { AlertService } from '../../services/alert.service';

declare var bootstrap: any;

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
    cliente: {
      id: 0, firstName: '', lastName: '', typeDocument: '',
      businessName: '', documentNumber: '', phoneNumber: '', email: ''
    },
    vehiculo: { id: 0, placa: '', marca: '', modelo: '', year: '' },
    detalles: []
  };
  maxAnio = new Date().getFullYear(); // Ejemplo: 2025
  clienteEncontrado: boolean | null = null;
  busquedaRealizada: boolean = false;
  vehiculoEncontrado: boolean | null = null;
  busquedaVehiculoRealizada: boolean = false;
  busquedaProducto: string = '';
  productosFiltrados: Product[] = [];
  isEdit = false;
  idCotizacion: number | null = null;
  private modalCliente: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cotizacionService: CotizacionService,
    private productService: ProductService,
    private clientService: ClientService,
    private vehicleService: VehicleService,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // Inicializar modal cliente
    this.modalCliente = new bootstrap.Modal(document.getElementById('clienteModal'));

    if (id) {
      this.idCotizacion = +id;
      this.isEdit = true;
      this.cotizacionService.obtenerCotizacionPorId(+id).subscribe({
        next: (res) => {
          this.cotizacion = { ...res.data };
          if (!this.cotizacion.detalles) this.cotizacion.detalles = [];
          this.actualizarTotales();
        },
        error: (err) => {
          console.error('Error al cargar cotización:', err);
        }
      });
    }
  }

  guardar(): void {
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
        next: () => {
          this.alertService.success('Cotización actualizada', 'La cotización fue actualizada con éxito');
          this.router.navigate(['/cotizaciones']);
        },
        error: (err) => {
          this.alertService.error('Error al actualizar cotización: ', err + (err.error?.message || err.message));
        }
      });
    } else {
      this.cotizacionService.crearCotizacion(dto).subscribe({
        next: () => {
          this.alertService.success('Cotización creada ', 'La cotización fue creada con éxito');
          this.router.navigate(['/cotizaciones']);
        },
        error: (err) => {
          this.alertService.error('Error al crear cotización: ', err + (err.error?.message || err.message));
        }
      });
    }
  }

  convertirACotizacionDTO(): CotizacionDto {
    return {
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
  }

  buscarClientePorDocumento(): void {
    const documento = this.cotizacion.cliente?.documentNumber;
    if (!documento) return;

    this.clientService.searchByDocument(documento).subscribe({
      next: (response) => {
        this.cotizacion.cliente = response.data;
        this.clienteEncontrado = true;
        this.busquedaRealizada = true;
        this.cdRef.detectChanges();
        this.alertService.success('Cliente encontrado', 'Los datos del cliente han sido cargados.');
      },
      error: () => {
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
    });
  }
  documentoValido(): boolean {
    const tipo = this.cotizacion.cliente?.typeDocument;
    const doc = this.cotizacion.cliente?.documentNumber;

    if (!tipo || !doc) return false;

    if (tipo === 'DNI') {
      return /^\d{8}$/.test(doc);
    }

    if (tipo === 'RUC') {
      return /^\d{11}$/.test(doc);
    }

    return false;
  }

  openModalCliente(mode: 'create'): void {
    this.modalCliente.show();
  }

  closeModalCliente(): void {
    this.modalCliente.hide();
  }

  onSubmitClient(): void {
    const c = this.cotizacion.cliente!;
    const isValid = c.typeDocument && c.documentNumber &&
      ((c.typeDocument === 'DNI' && c.firstName && c.lastName) ||
        (c.typeDocument === 'RUC' && c.businessName));

    if (!isValid) {
      this.alertService.requiredFields();
      return;
    }

    this.clientService.create(c).subscribe({
      next: (res) => {
        this.alertService.success('Cliente registrado', 'El cliente fue creado exitosamente.');
        this.cotizacion.cliente = res.data;
        this.clienteEncontrado = true;
        this.closeModalCliente();
      },
      error: () => {
        this.alertService.error('Error', 'No se pudo registrar el cliente.');
      }
    });
  }

  buscarVehiculoPorPlaca(): void {
    const placa = this.cotizacion.vehiculo?.placa;
    if (!placa) return;

    this.vehicleService.getByPlaca(placa).subscribe({
      next: (response) => {
        this.cotizacion.vehiculo = response.data;
        this.vehiculoEncontrado = true;
        this.busquedaVehiculoRealizada = true;
        this.alertService.success('Vehículo encontrado', `Se ha cargado el vehículo con placa ${placa}.`);
      },
      error: () => {
        this.vehiculoEncontrado = false;
        this.busquedaVehiculoRealizada = true;
        this.cotizacion.vehiculo = {
          placa: placa,
          marca: '',
          modelo: '',
          year: ''
        };
        this.alertService.warning('Vehículo no encontrado', `Puede registrar uno nuevo.`);
      }
    });
  }

  guardarVehiculo(): void {
    this.vehicleService.create(this.cotizacion.vehiculo!).subscribe({
      next: (res) => {
        this.cotizacion.vehiculo = res.data;
        this.vehiculoEncontrado = true;
        this.alertService.success('Vehículo guardado', 'El vehículo ha sido registrado correctamente.');
        const modal = document.getElementById('modalAgregarVehículo');
        if (modal) {
          const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
          modalInstance.hide();
        }
      },
      error: (err) => {
        this.alertService.error('Error al guardar vehículo', err);
      }
    });
  }

  buscarProducto(): void {
    const termino = this.busquedaProducto.trim();
    if (termino.length < 2) {
      this.productosFiltrados = [];
      return;
    }

    this.productService.search(termino).subscribe({
      next: (res) => {
        this.productosFiltrados = res.data;
      },
      error: () => {
        this.productosFiltrados = [];
      }
    });
  }

  agregarProducto(producto: Product): void {
    if (!producto.id) return;

    const existente = this.cotizacion.detalles.find(d => d.productoId === producto.id);

    if (existente) {
      existente.cantidad++;
      existente.subtotal = existente.cantidad * existente.precioUnitario;
    } else {
      const nuevo: DetalleCotizacion = {
        productoId: producto.id,
        nombreProducto: producto.name,
        cantidad: 1,
        precioUnitario: producto.salePrice!,
        subtotal: producto.salePrice!
      };
      this.cotizacion.detalles.push(nuevo);
    }

    this.actualizarTotales();
    this.productosFiltrados = [];
    this.busquedaProducto = '';
  }

  actualizarTotales(): void {
    const detalles = this.cotizacion.detalles.filter(d => d.cantidad > 0);
    detalles.forEach(d => d.subtotal = d.cantidad * d.precioUnitario);
    const subtotal = detalles.reduce((acc, d) => acc + d.subtotal, 0);
    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    this.cotizacion.subtotal = Math.round(subtotal * 100) / 100;
    this.cotizacion.igv = Math.round(igv * 100) / 100;
    this.cotizacion.total = Math.round(total * 100) / 100;
  }

  eliminarProducto(detalle: DetalleCotizacion): void {
    this.alertService.confirmDelete(detalle.nombreProducto).then(confirmado => {
      if (confirmado) {
        this.cotizacion.detalles = this.cotizacion.detalles.filter(d => d.productoId !== detalle.productoId);
        this.actualizarTotales();
        this.alertService.success('Producto eliminado', `"${detalle.nombreProducto}" fue eliminado correctamente.`);
      }
    });
  }
}
