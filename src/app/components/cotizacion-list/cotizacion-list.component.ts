import { Component, OnInit } from '@angular/core';
import { CotizacionService } from '../../services/cotizacion.service';
import { CotizacionResponse } from '../../models/cotizacion-response.model';
import { CotizacionDto } from '../../models/CotizacionDTO.model.';
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
  token: string | null = localStorage.getItem('token');

  constructor(
    private cotizacionService: CotizacionService,
    private router: Router,
    private http: HttpClient,
    private alertService: AlertService,
    private authService: AuthService
  ) { }
  role: string | null = null;
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
    if (this.searchTerm.trim()) {
      this.cotizacionService.search(this.searchTerm).subscribe({
        next: (response) => {
          this.cotizaciones = response.data || [];
        },
        error: (err) => {
          console.error(err);
        }
      });
    } else {
      this.cargarCotizaciones();
    }
  }



  cargarCotizaciones(): void {
    console.log('📊 Cargando todas las cotizaciones...');

    this.cotizacionService.listarCotizaciones().subscribe({
      next: (response) => {
        console.log('📥 Respuesta del listado:', response);
        console.log('📋 Datos recibidos:', response.data);

        this.cotizaciones = response.data || [];

        console.log('✅ Cotizaciones cargadas:', this.cotizaciones.length);

        this.verificarDuplicados();
      },
      error: (err) => {
        console.error('❌ Error al cargar cotizaciones:', err);
        this.cotizaciones = [];
      }
    });
  }

  private verificarDuplicados(): void {
    const ids = this.cotizaciones.map(c => c.id);
    const duplicados = ids.filter((id, index) => ids.indexOf(id) !== index);

    if (duplicados.length > 0) {
      console.warn('⚠️ Se encontraron IDs duplicados:', duplicados);

      this.eliminarDuplicados();
    }
  }

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
    this.alertService.confirmDelete('la cotización').then((confirmed) => {
      if (confirmed) {
        console.log('🗑️ Eliminando cotización ID:', id);
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
    this.alertService.confirmEdit('Editar cotización', '¿Deseas editar esta cotización?').then((confirmed) => {
      if (confirmed) {
        console.log('✏️ Editando cotización ID:', id);
        this.router.navigate(['/cotizaciones/editar', id]);
      }
    });
  }





  verPDF(id: number): void {
    const token = localStorage.getItem('token');
    const url = `http://localhost:8080/api/pdf/cotizacion/${id}?token=${token}`;
    window.open(url, '_blank');
  }


}