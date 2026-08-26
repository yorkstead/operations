import { describe, expect, it, beforeEach } from "bun:test";
import { SignworksService } from "../modules/demo/application/signworks-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Mile High Signworks Demo Scenario Module", () => {
  let signworksService: SignworksService;
  let identityService: IdentityService;

  beforeEach(() => {
    signworksService = new SignworksService();
    identityService = new IdentityService();
  });

  it("retrieves coherent Mile High Signworks architectural signage scenario fixture", () => {
    const data = signworksService.getSignworksScenario();

    expect(data.organization.name).toBe("Mile High Signworks");
    expect(data.project.projectNumber).toBe("SGN-2026-09");
    expect(data.project.currentRevision.revisionCode).toBe("Rev C (Final Production)");
    expect(data.project.permit.permitNumber).toBe("PERMIT-DEN-2026-881");
    expect(data.project.fabricationRouting.length).toBe(5);
  });

  it("approves vector artwork revision and transitions project status", () => {
    const { user } = identityService.bootstrapOwner({
      email: "maya.lin@signworks.synthetic",
      name: "Maya Lin",
      organizationName: "Mile High Signworks",
      organizationSlug: "mile-high-signworks",
    });

    const session = identityService.getSessionContext(user.id);
    session.activeOrganization.isDemo = true;

    const project = signworksService.approveArtworkRevision(session, "Rev C", "Marcus Vance (Client)");
    expect(project.currentRevision.status).toBe("client_approved");
    expect(project.currentRevision.approvalName).toBe("Marcus Vance (Client)");
    expect(project.currentRevision.approvalTimestamp).toBeDefined();
  });

  it("completes field crane installation with client signoff and proof photos", () => {
    const { user } = identityService.bootstrapOwner({
      email: "cole.bennett@signworks.synthetic",
      name: "Cole Bennett",
      organizationName: "Mile High Signworks",
      organizationSlug: "mile-high-signworks",
    });

    const session = identityService.getSessionContext(user.id);
    session.activeOrganization.isDemo = true;

    const project = signworksService.completeFieldInstallation(session, {
      clientSignoffName: "Marcus Vance",
      proofPhotoCount: 8,
    });

    expect(project.status).toBe("completed");
    expect(project.fieldInstallation.isMounted).toBe(true);
    expect(project.fieldInstallation.isElectricalConnected).toBe(true);
    expect(project.fieldInstallation.clientSignoffName).toBe("Marcus Vance");
  });
});
