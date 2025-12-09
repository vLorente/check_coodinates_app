import { Component, output, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-validation-form',
  imports: [ReactiveFormsModule],
  templateUrl: './validation-form.component.html',
  styleUrl: './validation-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationFormComponent {
  private fb = inject(FormBuilder);

  // Outputs
  onValidationComplete = output<void>();

  // Signals
  submitting = signal(false);
  errorMessage = signal<string | null>(null);
  addressMode = signal<'detailed' | 'single'>('detailed');

  // Reactive Form
  validationForm = this.fb.group({
    singleLineAddress: [''],
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
      let address: string;

      // Determinar la dirección según el modo seleccionado
      if (this.addressMode() === 'single') {
        address = formValue.singleLineAddress || '';
      } else {
        address = `${formValue.address?.street}, ${formValue.address?.city}, ${formValue.address?.postalCode}, ${formValue.address?.country}`;
      }

      const lat = formValue.coordinates?.latitude || '0';
      const lng = formValue.coordinates?.longitude || '0';

      // Abrir Google Maps con la dirección como origen y las coordenadas como destino
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(address)}&destination=${lat},${lng}&travelmode=driving`;

      window.open(googleMapsUrl, '_blank');

      this.onValidationComplete.emit();
      this.validationForm.reset({
        singleLineAddress: '',
        address: { country: 'España' },
        coordinates: {}
      });
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Error al abrir Google Maps');
    } finally {
      this.submitting.set(false);
    }
  }

  onClear(): void {
    this.validationForm.reset({
      singleLineAddress: '',
      address: { country: 'España' },
      coordinates: {}
    });
    this.errorMessage.set(null);
  }

  toggleAddressMode(mode: 'detailed' | 'single'): void {
    this.addressMode.set(mode);

    // Actualizar validadores según el modo
    const singleLineControl = this.validationForm.get('singleLineAddress');
    const addressGroup = this.validationForm.get('address');

    if (mode === 'single') {
      singleLineControl?.setValidators([Validators.required, Validators.minLength(5)]);
      addressGroup?.clearValidators();
      addressGroup?.get('street')?.clearValidators();
      addressGroup?.get('city')?.clearValidators();
      addressGroup?.get('postalCode')?.clearValidators();
    } else {
      singleLineControl?.clearValidators();
      addressGroup?.get('street')?.setValidators([Validators.required, Validators.minLength(3)]);
      addressGroup?.get('city')?.setValidators([Validators.required, Validators.minLength(2)]);
      addressGroup?.get('postalCode')?.setValidators([Validators.required, Validators.pattern(/^\d{5}$/)]);
    }

    singleLineControl?.updateValueAndValidity();
    addressGroup?.updateValueAndValidity();
    addressGroup?.get('street')?.updateValueAndValidity();
    addressGroup?.get('city')?.updateValueAndValidity();
    addressGroup?.get('postalCode')?.updateValueAndValidity();
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
