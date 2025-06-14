import { Component, OnInit } from '@angular/core';
import { VehicleService, Vehicle } from '../../../services/vehicle.service';

@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.css'
})
export class VehicleListComponent implements OnInit{
    vehicles: Vehicle[]=[]

    constructor(private vehicle: VehicleService){

    }

    ngOnInit(): void{
      this.loadVehicles();
    }

    loadVehicles(): void{
      this.vehicle.getAll().subscribe({
        next: (res) => {
        this.vehicles = res.data;
    },
    error: (err) => {
      console.error('Error al cargar vehículos:', err);
    }
    });
    }
    eliminar(id: number): void {
      if (confirm('¿Deseas eliminar este vehículo?')) {
        this.vehicle.delete(id).subscribe(() => this.loadVehicles());
      }
    }
}