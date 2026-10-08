// Options for the search attributes shared by compounds (defaults) and properties (overrides).
// Keep in sync with Jeeran-Backend/utils/propertyEnums.js.

export type Finishing = 'fully_finished' | 'semi_finished' | 'core_shell' | 'furnished';
export type PaymentOption = 'cash' | 'installments' | 'mortgage';
export type Amenity =
  | 'sea_view' | 'pool_view' | 'private_garden' | 'roof'
  | 'golf_view' | 'beach_access' | 'corner_unit' | 'parking';

export const FINISHINGS: { value: Finishing; label: string }[] = [
  { value: 'fully_finished', label: 'Fully finished' },
  { value: 'semi_finished',  label: 'Semi-finished' },
  { value: 'core_shell',     label: 'Core & shell' },
  { value: 'furnished',      label: 'Furnished' },
];

export const PAYMENT_OPTIONS: { value: PaymentOption; label: string }[] = [
  { value: 'cash',         label: 'Cash' },
  { value: 'installments', label: 'Installments' },
  { value: 'mortgage',     label: 'Mortgage eligible' },
];

export const AMENITIES: { value: Amenity; label: string }[] = [
  { value: 'sea_view',       label: 'Sea view' },
  { value: 'pool_view',      label: 'Pool view' },
  { value: 'private_garden', label: 'Private garden' },
  { value: 'roof',           label: 'Roof' },
  { value: 'golf_view',      label: 'Golf view' },
  { value: 'beach_access',   label: 'Beach access' },
  { value: 'corner_unit',    label: 'Corner unit' },
  { value: 'parking',        label: 'Parking' },
];

/** The shared attribute block (a compound's defaults / a unit's overrides). null = not set / inherit. */
export interface ListingAttributes {
  delivery_date:        string | null;
  finishing:            Finishing | null;
  payment_options:      PaymentOption[] | null;
  down_payment_percent: number | null;
  installment_years:    number | null;
}

export function emptyListingAttributes(): ListingAttributes {
  return { delivery_date: null, finishing: null, payment_options: null, down_payment_percent: null, installment_years: null };
}
