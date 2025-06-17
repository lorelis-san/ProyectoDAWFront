import { Component, OnInit } from '@angular/core';
import { VehicleService } from '../../../services/vehicle.service';
import { Vehicle } from '../../../models/vehicle.model';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert.service';
@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.css'
})
export class VehicleListComponent implements OnInit {
  vehicles: Vehicle[] = []

  constructor(private vehicle: VehicleService, private alertService: AlertService, private router: Router) {

  }

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.vehicle.getAll().subscribe({
      next: (res) => {
        this.vehicles = res.data;
      },
      error: (err) => {
        console.error('Error al cargar vehículos:', err);
      }
    });
  }


  async edit(id: number): Promise<void> {
    const confirmed = await this.alertService.confirmEdit(
      '¿Editar vehículo?',
      'Estás a punto de editar este vehículo.'
    );

    if (confirmed) {
      this.router.navigate(['/vehiculos/editar', id]);
    }
  }
  eliminar(id: number): void {
    this.alertService.confirmDelete('vehículo').then(confirmed => {
      if (confirmed) {
        this.vehicle.delete(id).subscribe({
          next: () => {
            this.alertService.success('Vehículo eliminado', 'El vehículo fue eliminado correctamente.');
            this.loadVehicles();
          },
          error: () => {
            this.alertService.error('Error', 'No se pudo eliminar el vehículo.');
          }
        });
      }
    });
  }

}