import { Component, output, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationService } from '@core/services/validation.service';
import { type ValidationResult } from '@core/models';

@Component({
  selector: 'app-validation-history',
  imports: [CommonModule],
  templateUrl: './validation-history.component.html',
  styleUrl: './validation-history.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationHistoryComponent {
  private validationService = inject(ValidationService);

  // Outputs
  onSelectValidation = output<ValidationResult>();
  onDeleteValidation = output<string>();

  // Signals from service
  validations = this.validationService.validations;
  loading = this.validationService.loading;

  // Computed values
  hasValidations = computed(() => this.validations().length > 0);

  handleSelectValidation(validation: ValidationResult): void {
    this.onSelectValidation.emit(validation);
  }

  handleDeleteValidation(id: string, event: Event): void {
    event.stopPropagation();

    if (confirm('¿Estás seguro de que deseas eliminar esta validación?')) {
      this.validationService.deleteValidation(id);
      this.onDeleteValidation.emit(id);
    }
  }

  formatDistance(distance: number): string {
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    }
    return `${(distance / 1000).toFixed(2)} km`;
  }

  formatDate(timestamp: Date): string {
    return new Date(timestamp).toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  }

  formatAddress(address: any): string {
    return `${address.street}, ${address.city}`;
  }
}
