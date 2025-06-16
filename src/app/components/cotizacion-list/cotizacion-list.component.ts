import { Component, OnInit } from '@angular/core';
import { CotizacionService } from '../../services/cotizacion.service';
import { CotizacionResponse } from '../../models/cotizacion-response.model';
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

  constructor(private cotizacionService: CotizacionService, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.cotizacionService.listarCotizaciones().subscribe(response => {
      this.cotizaciones = response.data;
    });
    this.getCotizacion();
  }

 onSearch(): void {
  if (this.searchTerm) {
    this.cotizacionService.obtenerCotizacionPorId(this.searchTerm).subscribe({
      next: (response) => {
        this.cotizaciones = response.data || [];
      },
      error: (err) => console.error(err)
    });
    } else {
      this.getCotizacion();
    }
  }


  getCotizacion() {
    this.cotizacionService.listarCotizaciones().subscribe(response => {
      this.cotizaciones = response.data; // asegúrate de que coincide con tu backend
    });
  }
  deleteCotizacion(id: number) {
    if (confirm('¿Estás seguro de eliminar esta cotización?')) {
      this.cotizacionService.eliminarCotizacion(id).subscribe(() => {
        this.getCotizacion(); // recargar lista
      });
    }
  }
  editCotizacion(id: number): void {
    this.router.navigate(['/cotizaciones/editar', id]);
    console.log('se va con id:', id);
   
  }
}
