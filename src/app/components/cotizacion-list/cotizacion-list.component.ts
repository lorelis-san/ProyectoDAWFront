import { Component, OnInit } from '@angular/core';
import { CotizacionService } from '../../services/cotizacion.service';
import { CotizacionResponse } from '../../models/cotizacion-response.model';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cotizacion-list',
  templateUrl: './cotizacion-list.component.html',
  styleUrls: ['./cotizacion-list.component.css']
})
export class CotizacionListComponent implements OnInit {
  cotizaciones: CotizacionResponse[] = [];
  searchTerm: string = '';
  estadoFiltro: string = ''; // Nuevo: filtro de estado
  role: string | null = null;

  // Estados disponibles para el filtro
  estadosDisponibles: string[] = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'MODIFICADA'];

  constructor(
    private cotizacionService: CotizacionService,
    private router: Router,
    private http: HttpClient,
    private alertService: AlertService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarCotizaciones();
    this.role = this.authService.getUserRole();
  }

  isAdmin(): boolean {
    return this.role === 'ROLE_ADMIN';
  }

  isUser(): boolean {
    return this.role === 'ROLE_USER';
  }

  onSearch(): void {
    const term = this.searchTerm.trim();
    
    // Si no hay término de búsqueda ni filtro de estado, cargar todas
    if (!term && !this.estadoFiltro) {
      this.cargarCotizaciones();
      return;
    }

    // Si solo hay filtro de estado, buscar por estado
    if (!term && this.estadoFiltro) {
      this.buscarPorEstado();
      return;
    }

    // Búsqueda general (puede incluir estado en el término)
    this.cotizacionService.search(term).subscribe({
      next: (response) => {
        let resultados = response?.data || [];
        
        // Si hay filtro de estado, aplicar filtrado adicional
        if (this.estadoFiltro) {
          resultados = resultados.filter((cot: CotizacionResponse) => cot.estado === this.estadoFiltro);
        }
        
        this.cotizaciones = resultados;
      },
      error: (err) => {
        if (err.status === 404) {
          this.cotizaciones = [];
          console.warn('No se encontraron cotizaciones para:', term);
        } else {
          console.error('Error inesperado en búsqueda:', err);
          this.alertService.error('Error', 'Ocurrió un error al buscar cotizaciones.');
        }
      }
    });
  }

  // Método para buscar solo por estado
  private buscarPorEstado(): void {
    this.cotizacionService.search(this.estadoFiltro).subscribe({
      next: (response) => {
        this.cotizaciones = response?.data || [];
      },
      error: (err) => {
        if (err.status === 404) {
          this.cotizaciones = [];
        } else {
          console.error('Error al buscar por estado:', err);
          this.alertService.error('Error', 'Ocurrió un error al filtrar por estado.');
        }
      }
    });
  }

  // Método para limpiar filtros
  limpiarFiltros(): void {
    this.searchTerm = '';
    this.estadoFiltro = '';
    this.cargarCotizaciones();
  }

  cargarCotizaciones(): void {
    this.cotizacionService.listarCotizaciones().subscribe({
      next: (response) => {
        this.cotizaciones = response?.data || [];
        this.verificarDuplicados();
      },
      error: (err) => {
        this.cotizaciones = [];
        console.error('Error al cargar cotizaciones:', err);
      }
    });
  }

  private verificarDuplicados(): void {
    const ids = this.cotizaciones.map(c => c.id);
    const duplicados = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicados.length > 0) {
      this.eliminarDuplicados();
    }
  }

  private eliminarDuplicados(): void {
    const cotizacionesUnicas = this.cotizaciones.filter((cotizacion, index, self) =>
      index === self.findIndex(c => c.id === cotizacion.id)
    );
    this.cotizaciones = cotizacionesUnicas;
  }

  deleteCotizacion(id: number): void {
    this.alertService.confirmDelete('la cotización').then(confirmed => {
      if (confirmed) {
        this.cotizacionService.eliminarCotizacion(id).subscribe({
          next: () => {
            this.alertService.success('Eliminada', 'La cotización fue eliminada correctamente.');
            this.cargarCotizaciones();
          },
          error: (err) => {
            console.error('Error al eliminar cotización:', err);
            this.alertService.error('Error', 'No se pudo eliminar la cotización.');
          }
        });
      }
    });
  }

  editCotizacion(id: number): void {
    this.alertService.confirmEdit('Editar cotización', '¿Deseas editar esta cotización?').then(confirmed => {
      if (confirmed) {
        this.router.navigate(['/cotizaciones/editar', id]);
      }
    });
  }

  verPDF(id: number): void {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No se encontró token. Por favor, inicia sesión.');
      return;
    }
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = `http://localhost:8080/api/pdf/cotizacion/${id}`;

    this.http.get(url, { headers, responseType: 'blob' }).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      },
      error: (err) => console.error('Error al obtener el PDF:', err)
    });
  }

  aprobarCotizacion(id?: number): void {
    if (!id) return;

    this.cotizacionService.actualizarEstadoCotizacion(id, 'APROBADA').subscribe({
      next: (res) => {
        this.alertService.success('Estado actualizado', res.mensaje);
        const cot = this.cotizaciones.find(c => c.id === id);
        if (cot) cot.estado = 'APROBADA';
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        this.alertService.error('Error', 'No se pudo actualizar el estado.');
      }
    });
  }

  rechazarCotizacion(id: number): void {
    this.cotizacionService.actualizarEstadoCotizacion(id, 'RECHAZADA').subscribe({
      next: (res) => {
        this.alertService.success('Actualizado', res.mensaje);
        const cot = this.cotizaciones.find(c => c.id === id);
        if (cot) cot.estado = 'RECHAZADA';
      },
      error: (err) => {
        console.error(err);
        this.alertService.error('Error', 'No se pudo actualizar el estado.');
      }
    });
  }
}