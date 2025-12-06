import { Coordinate } from './coordinate.model';
import { Address } from './address.model';

export interface ValidationRequest {
  address: Address;
  coordinates: Coordinate;
}

export interface ValidationResult {
  id: string;
  isValid: boolean;
  distance: number; // en metros
  message: string;
  addressCoordinates: Coordinate;
  inputCoordinates: Coordinate;
  timestamp: Date;
  address: Address;
  route?: any; // google.maps.DirectionsResult se tipará cuando esté disponible
}

export interface ValidationHistory {
  validations: ValidationResult[];
  total: number;
}

export interface ValidationApiResponse {
  id: string;
  is_valid: boolean;
  distance: number;
  message: string;
  address_coordinates: {
    latitude: number;
    longitude: number;
  };
  input_coordinates: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
}

export function mapApiResponseToValidationResult(
  response: ValidationApiResponse,
  address: Address
): ValidationResult {
  return {
    id: response.id,
    isValid: response.is_valid,
    distance: response.distance,
    message: response.message,
    addressCoordinates: response.address_coordinates,
    inputCoordinates: response.input_coordinates,
    timestamp: new Date(response.timestamp),
    address
  };
}
