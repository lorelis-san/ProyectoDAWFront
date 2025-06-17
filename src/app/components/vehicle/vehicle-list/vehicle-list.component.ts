import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehicleService } from '../../../services/vehicle.service';
import { Vehicle } from '../../../models/vehicle.model';
import { AlertService } from '../../../services/alert.service';

declare var bootstrap: any; // Para usar Bootstrap modal

@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.css'
})
export class VehicleListComponent implements OnInit {
  vehicles: Vehicle[] = [];
  form: FormGroup;
  isEditMode = false;
  vehicleId?: number;
  private modal: any;

  constructor(
    private vehicleService: VehicleService, 
    private alertService: AlertService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      placa: ['', Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      year: [null, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]]
    });
  }

  ngOnInit(): void {
    this.loadVehicles();
    // Inicializar modal de Bootstrap
    this.modal = new bootstrap.Modal(document.getElementById('vehicleModal'));
  }

  loadVehicles(): void {
    this.vehicleService.getAll().subscribe({
      next: (res) => {
        this.vehicles = res.data;
      },
      error: (err) => {
        console.error('Error al cargar vehículos:', err);
        this.alertService.error('Error', 'No se pudieron cargar los vehículos.');
      }
    });
  }

  openModal(mode: 'create' | 'edit', vehicle?: Vehicle): void {
    this.isEditMode = mode === 'edit';
    
    if (this.isEditMode && vehicle) {
      this.vehicleId = vehicle.id;
      this.form.patchValue({
        placa: vehicle.placa,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        year: vehicle.year
      });
    } else {
      this.vehicleId = undefined;
      this.form.reset();
    }

    // Mostrar modal
    this.modal.show();
  }

  closeModal(): void {
    this.modal.hide();
    this.form.reset();
    this.isEditMode = false;
    this.vehicleId = undefined;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.alertService.requiredFields();
      this.markFormGroupTouched();
      return;
    }

    const vehicle: Vehicle = this.form.value;

    if (this.isEditMode && this.vehicleId !== undefined) {
      this.updateVehicle(vehicle);
    } else {
      this.createVehicle(vehicle);
    }
  }

  private createVehicle(vehicle: Vehicle): void {
    this.vehicleService.create(vehicle).subscribe({
      next: () => {
        this.alertService.success('Vehículo registrado', 'El vehículo fue creado exitosamente.');
        this.closeModal();
        this.loadVehicles();
      },
      error: () => {
        this.alertService.error('Error', 'No se pudo registrar el vehículo.');
      }
    });
  }

  private updateVehicle(vehicle: Vehicle): void {
    this.vehicleService.update(this.vehicleId!, vehicle).subscribe({
      next: () => {
        this.alertService.success('Vehículo actualizado', 'El vehículo fue actualizado correctamente.');
        this.closeModal();
        this.loadVehicles();
      },
      error: () => {
        this.alertService.error('Error', 'No se pudo actualizar el vehículo.');
      }
    });
  }

  async edit(id: number): Promise<void> {
    const confirmed = await this.alertService.confirmEdit(
      '¿Editar vehículo?',
      'Estás a punto de editar este vehículo.'
    );

    if (confirmed) {
      // Buscar el vehículo por ID para abrirlo en el modal
      const vehicle = this.vehicles.find(v => v.id === id);
      if (vehicle) {
        this.openModal('edit', vehicle);
      }
    }
  }

  eliminar(id: number): void {
    this.alertService.confirmDelete('vehículo').then(confirmed => {
      if (confirmed) {
        this.vehicleService.delete(id).subscribe({
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

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }
}