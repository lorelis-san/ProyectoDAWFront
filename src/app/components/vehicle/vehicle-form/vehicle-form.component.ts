import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehicleService } from '../../../services/vehicle.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Vehicle } from '../../../models/vehicle.model';
import { AlertService } from '../../../services/alert.service';
@Component({
  selector: 'app-vehicle-form',
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.css']
})
export class VehicleFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  vehicleId?: number;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService
  ) {
    this.form = this.fb.group({
      placa: ['', Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      year: [null, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]]
    });
  }

  ngOnInit(): void {
    this.vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.vehicleId;

    if (this.isEditMode) {
      this.vehicleService.getById(this.vehicleId!).subscribe({
        next: (res) => {
          const vehicle = res.data;
          this.form.patchValue(vehicle);
        },
        error: (err) => {
          console.error('Error al cargar vehículo', err);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.alertService.requiredFields();
      return;
    }

    const vehicle: Vehicle = this.form.value;

    if (this.isEditMode && this.vehicleId !== undefined) {
      this.vehicleService.update(this.vehicleId, vehicle).subscribe({
        next: () => {
          this.alertService.success('Vehículo actualizado', 'El vehículo fue actualizado correctamente.');
          this.router.navigate(['/vehiculos']);
        },
        error: () => {
          this.alertService.error('Error', 'No se pudo actualizar el vehículo.');
        }
      });
    } else {
      this.vehicleService.create(vehicle).subscribe({
        next: () => {
          this.alertService.success('Vehículo registrado', 'El vehículo fue creado exitosamente.');
          this.router.navigate(['/vehiculos']);
        },
        error: () => {
          this.alertService.error('Error', 'No se pudo registrar el vehículo.');
        }
      });
    }
  }

}
