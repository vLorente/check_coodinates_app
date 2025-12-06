import { Component, output, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationService } from '@core/services/validation.service';
import { type ValidationRequest } from '@core/models';

@Component({
  selector: 'app-validation-form',
  imports: [ReactiveFormsModule],
  templateUrl: './validation-form.component.html',
  styleUrl: './validation-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationFormComponent {
  private fb = inject(FormBuilder);
  private validationService = inject(ValidationService);

  // Outputs
  onValidationComplete = output<void>();

  // Signals
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  // Reactive Form
  validationForm = this.fb.group({
    address: this.fb.group({
      street: ['', [Validators.required, Validators.minLength(3)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      country: ['España', Validators.required]
    }),
    coordinates: this.fb.group({
      latitude: ['', [Validators.required, Validators.pattern(/^-?\d+\.?\d*$/), this.coordinateRangeValidator('lat')]],
      longitude: ['', [Validators.required, Validators.pattern(/^-?\d+\.?\d*$/), this.coordinateRangeValidator('lng')]]
    })
  });

  async onSubmit(): Promise<void> {
    if (this.validationForm.invalid) {
      this.validationForm.markAllAsTouched();
      return;
    }

    try {
      this.submitting.set(true);
      this.errorMessage.set(null);

      const formValue = this.validationForm.value;

      const request: ValidationRequest = {
        address: {
          street: formValue.address?.street || '',
          city: formValue.address?.city || '',
          postalCode: formValue.address?.postalCode || '',
          country: formValue.address?.country || 'España'
        },
        coordinates: {
          latitude: parseFloat(formValue.coordinates?.latitude || '0'),
          longitude: parseFloat(formValue.coordinates?.longitude || '0')
        }
      };

      await this.validationService.validateCoordinates(request);

      this.onValidationComplete.emit();
      this.validationForm.reset({
        address: { country: 'España' },
        coordinates: {}
      });
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Error al validar coordenadas');
    } finally {
      this.submitting.set(false);
    }
  }

  onClear(): void {
    this.validationForm.reset({
      address: { country: 'España' },
      coordinates: {}
    });
    this.errorMessage.set(null);
  }

  private coordinateRangeValidator(type: 'lat' | 'lng') {
    return (control: any) => {
      const value = parseFloat(control.value);

      if (isNaN(value)) {
        return { invalidNumber: true };
      }

      if (type === 'lat') {
        if (value < -90 || value > 90) {
          return { latitudeRange: true };
        }
      } else {
        if (value < -180 || value > 180) {
          return { longitudeRange: true };
        }
      }

      return null;
    };
  }

  // Getters para facilitar acceso en template
  get addressGroup() {
    return this.validationForm.get('address');
  }

  get coordinatesGroup() {
    return this.validationForm.get('coordinates');
  }
}
