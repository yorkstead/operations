export type MasterDataStatus = "active" | "inactive" | "archived";

export type LocationType =
  | "headquarters"
  | "shopfloor"
  | "warehouse"
  | "shipping_dock"
  | "customer_site"
  | "vendor_site";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  status: MasterDataStatus;
  externalId?: string;
  paymentTerms: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  status: MasterDataStatus;
  externalId?: string;
  category: string;
  leadTimeDays: number;
  remitAddress?: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  organizationId: string;
  customerId?: string;
  vendorId?: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationLocation {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  type: LocationType;
  address: Address;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
