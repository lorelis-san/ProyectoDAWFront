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
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idCotizacion = +id;
      this.isEdit = true;
      
      console.log('🔍 Cargando cotización para editar, ID:', id);
      
      this.cotizacionService.obtenerCotizacionPorId(+id).subscribe({
        next: (res) => {
          console.log('📥 Datos recibidos del backend:', res.data);
          
          this.cotizacion = { ...res.data }; // Crear una nueva referencia
          
          if (!this.cotizacion.detalles) {
            this.cotizacion.detalles = [];
          }
          
          console.log('📋 Detalles cargados:', this.cotizacion.detalles);
          this.actualizarTotales();
          this.cdRef.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error al cargar cotización:', err);
        }
      });
    }
  }

  guardar() {
    console.log('💾 Iniciando proceso de guardado...');
    console.log('📋 Detalles antes de convertir a DTO:', this.cotizacion.detalles);
    
    // ✅ Validar que tengamos detalles
    if (!this.cotizacion.detalles || this.cotizacion.detalles.length === 0) {
      alert('⚠️ Debe agregar al menos un producto a la cotización');
      return;
    }

    // ✅ Validar IDs obligatorios
    if (!this.cotizacion.cliente?.id || !this.cotizacion.vehiculo?.id) {
      alert('⚠️ Debe seleccionar un cliente y un vehículo');
      return;
    }

    const dto = this.convertirACotizacionDTO();
    console.log('📤 COTIZACIÓN DTO A ENVIAR:', JSON.stringify(dto, null, 2));
    console.log('🔄 Modo edición:', this.isEdit, 'ID de cotización:', this.idCotizacion);

    if (this.isEdit && this.idCotizacion !== null) {
      this.actualizarTotales();
      this.cotizacionService.actualizarCotizacion(this.idCotizacion, dto).subscribe({
        next: (res) => {
          console.log('✅ Respuesta de actualización:', res);
          alert('✅ Cotización actualizada con éxito');
          this.router.navigate(['/cotizaciones']);
        },
        error: (err) => {
          console.error('❌ Error al actualizar cotización:', err);
          alert('❌ Error al actualizar cotización: ' + (err.error?.message || err.message));
        }
      });
    } else {
      this.cotizacionService.crearCotizacion(dto).subscribe({
        next: (res) => {
          console.log('✅ Respuesta de creación:', res);
          alert('✅ Cotización creada con éxito');
          this.router.navigate(['/cotizaciones']);
        },
        error: (err) => {
          console.error('❌ Error al crear cotización:', err);
          alert('❌ Error al crear cotización: ' + (err.error?.message || err.message));
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
        .filter(det => det.cantidad > 0) // ✅ Solo incluir detalles con cantidad > 0
        .map(det => ({
          productoId: det.productoId!,
          cantidad: det.cantidad,
          precioUnitario: det.precioUnitario
        }))
    };
    
    console.log('🔄 DTO convertido:', dto);
    return dto;
  }

  buscarProducto() {
    const termino = this.busquedaProducto.trim();

    if (termino.length >= 2) {
      this.productService.search(termino).subscribe({
        next: (response) => {
          this.productosFiltrados = response.data;
          console.log('🔍 Productos encontrados:', response.data);
        },
        error: (err) => {
          console.error('❌ Error al buscar productos', err);
          this.productosFiltrados = [];
        }
      });
    } else {
      this.productosFiltrados = [];
    }
  }

  agregarProducto(producto: Product) {
    if (producto.id == null) {
      console.error('❌ El producto no tiene ID');
      return;
    }

    console.log('➕ Agregando producto:', producto.name, 'ID:', producto.id);
    
    const existente = this.cotizacion.detalles.find(d => d.productoId === producto.id);

    if (existente) {
      console.log('📈 Producto ya existe, aumentando cantidad');
      existente.cantidad += 1;
      existente.subtotal = existente.cantidad * existente.precioUnitario;
    } else {
      console.log('🆕 Agregando nuevo producto');
      const nuevoDetalle: DetalleCotizacion = {
        productoId: producto.id,
        nombreProducto: producto.name,
        cantidad: 1,
        precioUnitario: producto.salePrice!,
        subtotal: producto.salePrice!
      };

      this.cotizacion.detalles = [...this.cotizacion.detalles, nuevoDetalle]; // ✅ Crear nueva referencia
    }

    this.actualizarTotales();
    this.busquedaProducto = '';
    this.productosFiltrados = [];
    this.cdRef.detectChanges(); // ✅ Forzar detección de cambios
  }

  // ✅ Método mejorado para actualizar cantidad
  actualizarCantidad(detalle: DetalleCotizacion, nuevaCantidad: number): void {
    console.log('📊 Actualizando cantidad:', detalle.nombreProducto, 'Nueva cantidad:', nuevaCantidad);
    
    if (nuevaCantidad <= 0) {
      // Si la cantidad es 0 o negativa, eliminar el producto
      this.eliminarProducto(detalle);
      return;
    }

    // Buscar el detalle y actualizar
    const index = this.cotizacion.detalles.findIndex(d => d.productoId === detalle.productoId);
    if (index !== -1) {
      this.cotizacion.detalles[index] = {
        ...this.cotizacion.detalles[index],
        cantidad: nuevaCantidad,
        subtotal: nuevaCantidad * this.cotizacion.detalles[index].precioUnitario
      };
      
      // ✅ Crear nueva referencia del array para que Angular detecte el cambio
      this.cotizacion.detalles = [...this.cotizacion.detalles];
      
      this.actualizarTotales();
      this.cdRef.detectChanges();
    }
  }

  actualizarTotales() {
    console.log('🧮 Calculando totales...');
    
    // ✅ Filtrar solo detalles con cantidad > 0
    const detallesValidos = this.cotizacion.detalles.filter(d => d.cantidad > 0);
    
    // Actualizar subtotales individuales
    detallesValidos.forEach(detalle => {
      detalle.subtotal = detalle.precioUnitario * detalle.cantidad;
    });

    const subtotal = detallesValidos.reduce((acc, d) => acc + d.subtotal, 0);
    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    this.cotizacion.subtotal = Math.round(subtotal * 100) / 100; // ✅ Redondear a 2 decimales
    this.cotizacion.igv = Math.round(igv * 100) / 100;
    this.cotizacion.total = Math.round(total * 100) / 100;

    console.log('💰 Totales calculados:', {
      subtotal: this.cotizacion.subtotal,
      igv: this.cotizacion.igv,
      total: this.cotizacion.total
    });
  }

  // ✅ Método mejorado para eliminar producto
  eliminarProducto(detalleAEliminar: DetalleCotizacion): void {
    console.log('🗑️ Eliminando producto:', detalleAEliminar.nombreProducto);
    
    if (confirm(`¿Estás seguro de eliminar "${detalleAEliminar.nombreProducto}" de la cotización?`)) {
      // ✅ Crear nuevo array sin el elemento eliminado
      this.cotizacion.detalles = this.cotizacion.detalles.filter(
        (detalle) => detalle.productoId !== detalleAEliminar.productoId
      );
      
      console.log('📋 Detalles después de eliminar:', this.cotizacion.detalles);
      
      this.actualizarTotales();
      this.cdRef.detectChanges();
    }
  }

  // ✅ Método para limpiar detalles con cantidad 0
  limpiarDetallesVacios(): void {
    const detallesOriginales = this.cotizacion.detalles.length;
    
    this.cotizacion.detalles = this.cotizacion.detalles.filter(d => d.cantidad > 0);
    
    const detallesEliminados = detallesOriginales - this.cotizacion.detalles.length;
    
    if (detallesEliminados > 0) {
      console.log(`🧹 Eliminados ${detallesEliminados} detalles con cantidad 0`);
      this.actualizarTotales();
      this.cdRef.detectChanges();
    }
  }

  // Resto de métodos (cliente y vehículo) permanecen igual...
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

        const modal = document.getElementById('modalAgregarCliente');
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
          }, 300);
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
          }, 300); 
        }
      },
      error: (err) => {
        console.error('Error al guardar vehículo', err);
      }
    });
  }
}