export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  fullAddress?: string;
}

export function formatAddress(address: Address): string {
  const parts = [
    address.street,
    address.city,
    address.postalCode,
    address.country
  ].filter(Boolean);

  return parts.join(', ');
}

export function isValidAddress(address: Address): boolean {
  return !!(
    address.street?.trim() &&
    address.city?.trim() &&
    address.postalCode?.trim() &&
    address.country?.trim()
  );
}
