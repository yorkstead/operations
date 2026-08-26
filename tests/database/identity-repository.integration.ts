import { describe, expect, it } from "bun:test";
import { IdentityRepository } from "../../modules/core/infrastructure/identity-repository";

const describeDatabase = process.env.RUN_DATABASE_INTEGRATION === "1" ? describe : describe.skip;

describeDatabase("persistent identity repository against PostgreSQL", () => {
  it("persists owner memberships across repository instances and denies an unowned organization", async () => {
    const firstRepository = new IdentityRepository();
    const { user, organization } = await firstRepository.bootstrapOwner({
      email: "ci-owner@yorkstead.invalid",
      name: "CI Owner",
      organizationName: "CI Manufacturing",
      organizationSlug: "ci-manufacturing",
    });

    const secondRepository = new IdentityRepository();
    const session = await secondRepository.resolveSessionContext(user.id, organization.id);
    expect(session.activeOrganization.id).toBe(organization.id);
    expect(session.currentMembership.role).toBe("owner");

    await expect(secondRepository.resolveSessionContext(user.id, "org_not_owned")).rejects.toThrow(
      "User is not an active member"
    );
  });
});
