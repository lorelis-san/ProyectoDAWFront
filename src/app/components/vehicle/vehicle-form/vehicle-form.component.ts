import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehicleService, Vehicle } from '../../../services/vehicle.service';
import { ActivatedRoute, Router } from '@angular/router';

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
    private router: Router
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
    if (this.form.invalid) return;

    const vehicle: Vehicle = this.form.value;

    if (this.isEditMode && this.vehicleId !== undefined) {
      this.vehicleService.update(this.vehicleId, vehicle).subscribe(() => {
        this.router.navigate(['/vehiculos']);
      });
    } else {
      this.vehicleService.create(vehicle).subscribe(() => {
        this.router.navigate(['/vehiculos']);
      });
    }
  }
}
