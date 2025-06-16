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
    //detalles: {productoId: 0, nombreProducto: '', cantidad: 0 , precioUnitario: 0.0, subtotal: 0.0}
  };

  clienteEncontrado: boolean | null = null;
  busquedaRealizada: boolean = false;
  vehiculoEncontrado: boolean | null = null;
  busquedaVehiculoRealizada: boolean = false;
  typeDocument: string[] = ['RUC', 'DNI'];
  busquedaProducto: string = '';
  isEdit = false;
  productosFiltrados: Product[] = [];

cotizacionDTO: CotizacionDto = {
  clienteId: 0,
  vehiculoId: 0,
  observaciones: '',
  detalles: [] // Esto es un array
};


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cotizacionService: CotizacionService,
    private productService: ProductService,
    private clientService: ClientService,
    private vehicleService: VehicleService,
    private cdRef: ChangeDetectorRef,
  ) { }



  ngOnInit(): void {


    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.cotizacionService.obtenerCotizacionPorId(+id).subscribe(res => {
        this.cotizacion = res;
        this.actualizarTotales(); // Recalcula totales si los detalles vienen con cantidades
        this.cdRef.detectChanges(); // refresca el HTML
      });
    }

  }


  guardar() {
    if (!this.cotizacion.cliente || !this.cotizacion.vehiculo || this.cotizacion.detalles.length === 0) {
      alert('Debe completar cliente, vehículo y al menos un producto antes de guardar.');
      return;
    }

    const dto = this.convertirACotizacionDTO();
    console.log('COTIZACION DTO A ENVIAR:', JSON.stringify(dto, null, 2));

    if (this.isEdit) {
      const id = this.route.snapshot.paramMap.get('id');
      console.log(id);
      if (id !== null) {
        const idNumber = Number(id); // ✅ Conversión
        this.cotizacionService.actualizarCotizacion(idNumber, dto).subscribe({
          next: (res) => {
            alert('✅ Cotización actualizada con éxito');
            this.router.navigate(['/cotizaciones']);
          },
          error: (err) => {
            console.error('Error al actualizar cotización:', err);
            alert('❌ Error al actualizar cotización');
          }
        });
      }
    } else {
      this.cotizacionService.crearCotizacion(dto).subscribe({
        next: (res) => {
          alert('✅ Cotización creada con éxito');
          this.router.navigate(['/cotizaciones']);
        },
        error: (err) => {
          console.error('Error al crear cotización:', err);
          alert('❌ Error al crear cotización');
        }
      });
    }
  }



  convertirACotizacionDTO(): CotizacionDto {
    return {
      clienteId: this.cotizacion.cliente!.id!,
      vehiculoId: this.cotizacion.vehiculo!.id!,
      observaciones: this.cotizacion.observaciones!,
      detalles: this.cotizacion.detalles.map(det => ({
        productoId: det.productoId!,
        cantidad: det.cantidad,
        precioUnitario: det.precioUnitario
      }))
    };
  }



  buscarProducto() {
    const termino = this.busquedaProducto.trim();

    if (termino.length >= 2) { // opcional: evita buscar si hay muy pocos caracteres
      this.productService.search(termino).subscribe({
        next: (response) => {
          this.productosFiltrados = response.data;
          console.log(response.data)
        },
        error: (err) => {
          console.error('Error al buscar productos', err);
          this.productosFiltrados = [];
        }
      });
    } else {
      this.productosFiltrados = [];
    }
  }

  agregarProducto(producto: Product) {
    if (producto.id == null) {
      console.error('El producto no tiene ID');
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

      this.cotizacion.detalles.push(nuevoDetalle);

    }
    this.actualizarTotales();
    this.busquedaProducto = '';
    this.productosFiltrados = [];
  }

  actualizarTotales() {
    this.cotizacion.detalles.forEach(detalle => {
      detalle.subtotal = detalle.precioUnitario * detalle.cantidad;
    });
    const subtotal = this.cotizacion.detalles.reduce((acc, d) => acc + d.subtotal, 0);
    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    this.cotizacion.subtotal = subtotal;
    this.cotizacion.igv = igv;
    this.cotizacion.total = total;
  }

  eliminarProducto(detalleAEliminar: DetalleCotizacion): void {
    this.cotizacion.detalles = this.cotizacion.detalles.filter(
      (detalle) => detalle !== detalleAEliminar
    );
    this.actualizarTotales();
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
      },
      (error) => {
        console.log("Cliente no encontrado, puedes crear uno nuevo");
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
      }
    );
  }

  guardarCliente() {
    this.clientService.create(this.cotizacion.cliente!).subscribe({
      next: (response) => {
        console.log('Cliente guardado', response);
        this.cotizacion.cliente = response.data;
        this.clienteEncontrado = true;

        // Cierra el modal manualmente y limpia backdrop
        const modal = document.getElementById('modalAgregarCliente');
        if (modal) {
          const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
          modalInstance.hide();

          // Espera un poco antes de limpiar por si hay animación
          setTimeout(() => {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
              backdrop.remove();
            }
            // Remueve clase modal-open y estilos que bloquean scroll
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';// por si Bootstrap añadió scroll fix
          }, 300); // tiempo suficiente para la animación
        }
      },
      error: (err) => {
        console.error('Error al guardar cliente', err);
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
      },
      (error) => {
        console.log("Vehículo no encontrado, se puede registrar uno nuevo");
        this.vehiculoEncontrado = false;
        this.busquedaVehiculoRealizada = true;
        this.cotizacion.vehiculo = {
          placa: placa,
          marca: '',
          modelo: '',
          year: ''
        };
      }
    );
  }

  guardarVehiculo() {
    this.vehicleService.create(this.cotizacion.vehiculo!).subscribe({
      next: (response) => {
        console.log('Vehículo guardado', response);
        this.cotizacion.vehiculo = response.data;
        this.vehiculoEncontrado = true;

        const modal = document.getElementById('modalAgregarVehículo');
        if (modal) {
          const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
          modalInstance.hide();

          setTimeout(() => {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
              backdrop.remove();
            }

            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
          }, 300); // tiempo suficiente para la animación
        }
      },
      error: (err) => {
        console.error('Error al guardar vehículo', err);
      }
    });
  }


}

