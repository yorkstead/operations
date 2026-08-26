import { describe, expect, it } from "bun:test";
import { JobService } from "../modules/jobs/application/job-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Jobs Vertical Slice: Authentication, Tenancy & IDOR Denial Suite", () => {
  it("enforces tenant boundary isolation and denies cross-tenant access", () => {
    const identity = new IdentityService();
    const service = new JobService();

    // 1. Bootstrap Org 1
    const bootstrap1 = identity.bootstrapOwner({
      email: "owner1@frontrange.com",
      name: "Owner One",
      organizationName: "Front Range Manufacturing",
      organizationSlug: "front-range-mfg",
    });
    const sessionOrg1 = identity.getSessionContext(bootstrap1.user.id);

    // 2. Create Org 2
    const org2 = identity.createOrganization(bootstrap1.user.id, "Summit Facility Services", "summit-facility");
    const sessionOrg2 = identity.switchActiveOrganization(bootstrap1.user.id, org2.id);

    // 3. Create Job in Org 1
    const jobOrg1 = service.createJob(sessionOrg1, {
      title: "Org 1 Secret Laser Work",
      customerId: "cust_1",
      customerName: "Front Range Customer",
      targetDueDate: "2026-09-10",
    });

    // 4. Org 1 can retrieve its own job
    const retrievedOrg1 = service.getJob(sessionOrg1, jobOrg1.id);
    expect(retrievedOrg1.id).toBe(jobOrg1.id);

    // 5. Org 2 attempting to guess or access Org 1's job is denied (IDOR protection)
    expect(() => service.getJob(sessionOrg2, jobOrg1.id)).toThrow("Job not found in active organization");
  });

  it("denies access when user membership is removed", () => {
    const identity = new IdentityService();
    const bootstrap = identity.bootstrapOwner({
      email: "admin@yorkstead.com",
      name: "Admin User",
      organizationName: "Precision Shop",
      organizationSlug: "precision-shop",
    });

    const bootstrap2 = identity.createOrganization(bootstrap.user.id, "Second Shop", "second-shop");
    const sessionSecond = identity.switchActiveOrganization(bootstrap.user.id, bootstrap2.id);
    expect(sessionSecond.activeOrganization.id).toBe(bootstrap2.id);

    // Remove user membership from second shop
    identity.removeMembership(bootstrap.user.id, bootstrap2.id, bootstrap.user.id);

    // Switched session falls back to remaining membership
    const contextAfter = identity.getSessionContext(bootstrap.user.id);
    expect(contextAfter.activeOrganization.id).toBe(bootstrap.organization.id);
  });
});
