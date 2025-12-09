import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ValidationFormComponent } from '@features/validation/components/validation-form/validation-form.component';

@Component({
  selector: 'app-validation-page',
  imports: [ValidationFormComponent],
  templateUrl: './validation-page.component.html',
  styleUrl: './validation-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationPageComponent {
  handleValidationComplete(): void {
    // Google Maps ya se abrió desde el formulario
  }
}
