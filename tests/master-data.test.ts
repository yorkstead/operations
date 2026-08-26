import { describe, expect, it, beforeEach } from "bun:test";
import { MasterDataService } from "../modules/core/application/master-data-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Customers, Vendors, and Locations Master Data", () => {
  let masterDataService: MasterDataService;
  let identityService: IdentityService;

  beforeEach(() => {
    masterDataService = new MasterDataService();
    identityService = new IdentityService();
  });

  it("creates, retrieves, and archives customer records within tenant boundaries", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const sessionA = identityService.getSessionContext(owner.id);

    const customer = masterDataService.createCustomer(sessionA, {
      name: "Alpine Aerospace",
      code: "AERO-01",
      paymentTerms: "Net 30",
    });

    expect(customer.id).toBeDefined();
    expect(customer.code).toBe("AERO-01");
    expect(customer.status).toBe("active");

    // Re-creation with duplicate code in same org must fail
    expect(() => {
      masterDataService.createCustomer(sessionA, {
        name: "Duplicate Aerospace",
        code: "AERO-01",
      });
    }).toThrow("already exists");

    // List active customers
    const activeList = masterDataService.listCustomers(sessionA);
    expect(activeList.length).toBe(1);

    // Archive customer
    const archived = masterDataService.archiveCustomer(sessionA, customer.id);
    expect(archived.status).toBe("archived");

    // Unarchived list is now empty
    expect(masterDataService.listCustomers(sessionA).length).toBe(0);
    // Included archived list contains record
    expect(masterDataService.listCustomers(sessionA, true).length).toBe(1);
  });

  it("creates approved vendors and locations", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const sessionA = identityService.getSessionContext(owner.id);

    const vendor = masterDataService.createVendor(sessionA, {
      name: "Mile High Steel",
      code: "VEND-STEEL",
      category: "Raw Materials",
      leadTimeDays: 5,
    });

    expect(vendor.id).toBeDefined();
    expect(vendor.category).toBe("Raw Materials");

    const location = masterDataService.createLocation(sessionA, {
      name: "Main Facility",
      code: "LOC-01",
      type: "shopfloor",
      address: {
        line1: "1420 40th St",
        city: "Denver",
        state: "CO",
        postalCode: "80205",
        country: "USA",
      },
      isDefault: true,
    });

    expect(location.id).toBeDefined();
    expect(location.isDefault).toBe(true);

    const exportData = masterDataService.exportMasterDataJson(sessionA);
    expect(exportData.customers.length).toBe(0);
    expect(exportData.vendors.length).toBe(1);
    expect(exportData.locations.length).toBe(1);
  });
});
