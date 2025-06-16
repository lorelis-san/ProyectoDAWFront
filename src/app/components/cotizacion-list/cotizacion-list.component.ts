import { Component, OnInit } from '@angular/core';
import { CotizacionService } from '../../services/cotizacion.service';
import { CotizacionResponse } from '../../models/cotizacion-response.model';
import { CotizacionDto } from '../../models/CotizacionDTO.model.';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cotizacion-list',
  templateUrl: './cotizacion-list.component.html',
  styleUrls: ['./cotizacion-list.component.css']
})
export class CotizacionListComponent implements OnInit {
  cotizaciones: CotizacionResponse[] = [];
  searchTerm: number = 0;

  constructor(
    private cotizacionService: CotizacionService, 
    private router: Router, 
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    // ✅ SOLO una llamada para cargar las cotizaciones
    this.cargarCotizaciones();
  }

  onSearch(): void {
    if (this.searchTerm && this.searchTerm > 0) {
      console.log('🔍 Buscando cotización con ID:', this.searchTerm);
      
      this.cotizacionService.obtenerCotizacionPorId(this.searchTerm).subscribe({
        next: (response) => {
          console.log('📥 Respuesta de búsqueda:', response);
          
          // ✅ IMPORTANTE: Verificar si response.data es un array o un objeto
          if (Array.isArray(response.data)) {
            this.cotizaciones = response.data;
          } else {
            // Si es un objeto individual, lo convertimos a array
            this.cotizaciones = [response.data];
          }
          
          console.log('📋 Cotizaciones después de búsqueda:', this.cotizaciones);
        },
        error: (err) => {
          console.error('❌ Error en búsqueda:', err);
          this.cotizaciones = [];
        }
      });
    } else {
      // Si no hay término de búsqueda, mostrar todas
      this.cargarCotizaciones();
    }
  }

  // ✅ Método unificado para cargar cotizaciones
  cargarCotizaciones(): void {
    console.log('📊 Cargando todas las cotizaciones...');
    
    this.cotizacionService.listarCotizaciones().subscribe({
      next: (response) => {
        console.log('📥 Respuesta del listado:', response);
        console.log('📋 Datos recibidos:', response.data);
        
        this.cotizaciones = response.data || [];
        
        console.log('✅ Cotizaciones cargadas:', this.cotizaciones.length);
        
        // Opcional: Verificar si hay duplicados
        this.verificarDuplicados();
      },
      error: (err) => {
        console.error('❌ Error al cargar cotizaciones:', err);
        this.cotizaciones = [];
      }
    });
  }

  // ✅ Método para verificar y reportar duplicados
  private verificarDuplicados(): void {
    const ids = this.cotizaciones.map(c => c.id);
    const duplicados = ids.filter((id, index) => ids.indexOf(id) !== index);
    
    if (duplicados.length > 0) {
      console.warn('⚠️ Se encontraron IDs duplicados:', duplicados);
      
      // Opcional: Eliminar duplicados automáticamente
      this.eliminarDuplicados();
    }
  }

  // ✅ Método para eliminar duplicados
  private eliminarDuplicados(): void {
    const cotizacionesUnicas = this.cotizaciones.filter((cotizacion, index, self) => 
      index === self.findIndex(c => c.id === cotizacion.id)
    );
    
    if (cotizacionesUnicas.length !== this.cotizaciones.length) {
      console.log('🧹 Eliminando duplicados...');
      console.log('- Antes:', this.cotizaciones.length);
      console.log('- Después:', cotizacionesUnicas.length);
      
      this.cotizaciones = cotizacionesUnicas;
    }
  }

  deleteCotizacion(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta cotización?')) {
      console.log('🗑️ Eliminando cotización ID:', id);
      
      this.cotizacionService.eliminarCotizacion(id).subscribe({
        next: () => {
          console.log('✅ Cotización eliminada exitosamente');
          this.cargarCotizaciones(); // Recargar lista
        },
        error: (err) => {
          console.error('❌ Error al eliminar cotización:', err);
        }
      });
    }
  }

  editCotizacion(id: number): void {
    console.log('✏️ Editando cotización ID:', id);
    this.router.navigate(['/cotizaciones/editar', id]);
  }

  // ✅ Método para limpiar la búsqueda
  limpiarBusqueda(): void {
    this.searchTerm = 0;
    this.cargarCotizaciones();
  }


  verPDF(id: number): void {
   const url = `http://localhost:8080/api/pdf/cotizacion/${id}`;
  window.open(url, '_blank');
}

}