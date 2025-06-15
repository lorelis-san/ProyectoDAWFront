import { Component, OnInit } from '@angular/core';
import { CotizacionService } from '../../services/cotizacion.service';
import { CotizacionResponse } from '../../models/cotizacion-response.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cotizacion-list',
  templateUrl: './cotizacion-list.component.html',
  styleUrls: ['./cotizacion-list.component.css']
})
export class CotizacionListComponent implements OnInit {
  cotizaciones: CotizacionResponse[] = [];

  constructor(private cotizacionService: CotizacionService, private router: Router) {}

  ngOnInit(): void {
    this.cotizacionService.listarCotizaciones().subscribe(res => {
      this.cotizaciones = res;
    });
  }

  editar(id: number) {
    this.router.navigate(['/cotizaciones/editar', id]);
  }

  eliminar(id: number) {
    this.cotizacionService.eliminarCotizacion(id).subscribe(() => {
      this.ngOnInit();
    });
  }
}
