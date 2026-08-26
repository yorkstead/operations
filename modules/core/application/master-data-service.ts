import {
  Customer,
  Vendor,
  Contact,
  OrganizationLocation,
  Address,
  LocationType,
} from "../domain/master-data-types";
import { SessionContext } from "../domain/types";
import { activityService } from "./activity-service";
import { authorizationService } from "./authorization-service";

export class MasterDataService {
  private customers: Map<string, Customer> = new Map();
  private vendors: Map<string, Vendor> = new Map();
  private contacts: Map<string, Contact> = new Map();
  private locations: Map<string, OrganizationLocation> = new Map();

  // 1. Customer Operations
  createCustomer(
    session: SessionContext,
    params: {
      name: string;
      code: string;
      externalId?: string;
      paymentTerms?: string;
      billingAddress?: Address;
      shippingAddress?: Address;
    }
  ): Customer {
    authorizationService.requireCapability(session, "quoting:create_quote");

    const codeUpper = params.code.trim().toUpperCase();
    const existing = Array.from(this.customers.values()).find(
      (c) => c.organizationId === session.activeOrganization.id && c.code === codeUpper
    );
    if (existing) {
      throw new Error(`Customer code '${codeUpper}' already exists in this organization.`);
    }

    const id = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const customer: Customer = {
      id,
      organizationId: session.activeOrganization.id,
      name: params.name.trim(),
      code: codeUpper,
      status: "active",
      externalId: params.externalId?.trim(),
      paymentTerms: params.paymentTerms || "Net 30",
      billingAddress: params.billingAddress,
      shippingAddress: params.shippingAddress,
      createdAt: now,
      updatedAt: now,
    };

    this.customers.set(id, customer);

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: id,
      action: "customer.created",
      summary: `Created customer master record '${customer.name}' (${customer.code}).`,
    });

    return customer;
  }

  listCustomers(session: SessionContext, includeArchived = false): Customer[] {
    return Array.from(this.customers.values()).filter((c) => {
      if (c.organizationId !== session.activeOrganization.id) return false;
      return includeArchived ? true : c.status !== "archived";
    });
  }

  archiveCustomer(session: SessionContext, customerId: string): Customer {
    authorizationService.requireCapability(session, "org:manage_profile");

    const cust = this.customers.get(customerId);
    if (!cust || cust.organizationId !== session.activeOrganization.id) {
      throw new Error("Customer not found.");
    }

    cust.status = "archived";
    cust.updatedAt = new Date().toISOString();
    return cust;
  }

  // 2. Vendor Operations
  createVendor(
    session: SessionContext,
    params: {
      name: string;
      code: string;
      category: string;
      leadTimeDays?: number;
      externalId?: string;
      remitAddress?: Address;
    }
  ): Vendor {
    authorizationService.requireCapability(session, "inventory:receive_material");

    const codeUpper = params.code.trim().toUpperCase();
    const existing = Array.from(this.vendors.values()).find(
      (v) => v.organizationId === session.activeOrganization.id && v.code === codeUpper
    );
    if (existing) {
      throw new Error(`Vendor code '${codeUpper}' already exists in this organization.`);
    }

    const id = `vend_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const vendor: Vendor = {
      id,
      organizationId: session.activeOrganization.id,
      name: params.name.trim(),
      code: codeUpper,
      status: "active",
      category: params.category.trim(),
      leadTimeDays: params.leadTimeDays ?? 7,
      externalId: params.externalId?.trim(),
      remitAddress: params.remitAddress,
      createdAt: now,
      updatedAt: now,
    };

    this.vendors.set(id, vendor);

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: id,
      action: "vendor.created",
      summary: `Created vendor master record '${vendor.name}' (${vendor.code}).`,
    });

    return vendor;
  }

  listVendors(session: SessionContext, includeArchived = false): Vendor[] {
    return Array.from(this.vendors.values()).filter((v) => {
      if (v.organizationId !== session.activeOrganization.id) return false;
      return includeArchived ? true : v.status !== "archived";
    });
  }

  // 3. Location Operations
  createLocation(
    session: SessionContext,
    params: {
      name: string;
      code: string;
      type: LocationType;
      address: Address;
      isDefault?: boolean;
    }
  ): OrganizationLocation {
    authorizationService.requireCapability(session, "org:manage_profile");

    const id = `loc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const location: OrganizationLocation = {
      id,
      organizationId: session.activeOrganization.id,
      name: params.name.trim(),
      code: params.code.trim().toUpperCase(),
      type: params.type,
      address: params.address,
      isDefault: params.isDefault || false,
      createdAt: now,
      updatedAt: now,
    };

    this.locations.set(id, location);
    return location;
  }

  listLocations(session: SessionContext): OrganizationLocation[] {
    return Array.from(this.locations.values()).filter(
      (l) => l.organizationId === session.activeOrganization.id
    );
  }

  // 4. Contact Operations
  createContact(
    session: SessionContext,
    params: {
      name: string;
      email: string;
      customerId?: string;
      vendorId?: string;
      phone?: string;
      title?: string;
      isPrimary?: boolean;
    }
  ): Contact {
    const id = `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const contact: Contact = {
      id,
      organizationId: session.activeOrganization.id,
      customerId: params.customerId,
      vendorId: params.vendorId,
      name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      phone: params.phone?.trim(),
      title: params.title?.trim(),
      isPrimary: params.isPrimary || false,
      createdAt: now,
      updatedAt: now,
    };

    this.contacts.set(id, contact);
    return contact;
  }

  listContacts(session: SessionContext): Contact[] {
    return Array.from(this.contacts.values()).filter(
      (c) => c.organizationId === session.activeOrganization.id
    );
  }

  // 5. Audited Master Data Export / Import
  exportMasterDataJson(session: SessionContext): {
    customers: Customer[];
    vendors: Vendor[];
    locations: OrganizationLocation[];
    contacts: Contact[];
    exportedAt: string;
  } {
    return {
      customers: this.listCustomers(session, true),
      vendors: this.listVendors(session, true),
      locations: this.listLocations(session),
      contacts: this.listContacts(session),
      exportedAt: new Date().toISOString(),
    };
  }
}

export const masterDataService = new MasterDataService();
