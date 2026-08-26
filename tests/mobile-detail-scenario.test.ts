import { describe, expect, it, beforeEach } from "bun:test";
import { MobileDetailService } from "../modules/demo/application/mobile-detail-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Peak Mobile Detail Demo Scenario Module", () => {
  let mobileDetailService: MobileDetailService;
  let identityService: IdentityService;

  beforeEach(() => {
    mobileDetailService = new MobileDetailService();
    identityService = new IdentityService();
  });

  it("retrieves coherent Peak Mobile Detail vehicle intake scenario fixture", () => {
    const data = mobileDetailService.getMobileDetailScenario();

    expect(data.organization.name).toBe("Peak Mobile Detail");
    expect(data.appointment.vehicle.make).toBe("Porsche");
    expect(data.appointment.vehicle.model).toContain("911 GT3");
    expect(data.appointment.vehicle.paintDepthMicrons).toBe(135);
    expect(data.appointment.checklist.length).toBe(6);
  });

  it("toggles mobile technician detail checklist item", () => {
    const { user } = identityService.bootstrapOwner({
      email: "brooke.callahan@peakdetail.synthetic",
      name: "Brooke Callahan",
      organizationName: "Peak Mobile Detail",
      organizationSlug: "peak-mobile-detail",
    });

    const session = identityService.getSessionContext(user.id);
    session.activeOrganization.isDemo = true;

    const apt = mobileDetailService.toggleChecklistItem(session, "chk_d6");
    const item = apt.checklist.find((c) => c.id === "chk_d6");
    expect(item?.isCompleted).toBe(false);
  });

  it("approves on-site add-on and recalculates total invoice in integer cents", () => {
    const { user } = identityService.bootstrapOwner({
      email: "brooke.callahan@peakdetail.synthetic",
      name: "Brooke Callahan",
      organizationName: "Peak Mobile Detail",
      organizationSlug: "peak-mobile-detail",
    });

    const session = identityService.getSessionContext(user.id);
    session.activeOrganization.isDemo = true;

    const apt = mobileDetailService.approveAddOn(session, "addon_wheel_off", "Harrison Palmer");
    const addon = apt.addOns.find((a) => a.id === "addon_wheel_off");
    expect(addon?.isApproved).toBe(true);
    expect(apt.payment.amountCents).toBe(105000); // $700 base + $150 engine + $200 wheels off
  });

  it("completes appointment and intercepts simulated card payment", () => {
    const { user } = identityService.bootstrapOwner({
      email: "brooke.callahan@peakdetail.synthetic",
      name: "Brooke Callahan",
      organizationName: "Peak Mobile Detail",
      organizationSlug: "peak-mobile-detail",
    });

    const session = identityService.getSessionContext(user.id);
    session.activeOrganization.isDemo = true;

    const apt = mobileDetailService.completeAppointment(session, "4242");
    expect(apt.status).toBe("completed");
    expect(apt.payment.status).toBe("simulated_captured");
    expect(apt.payment.cardLast4).toBe("4242");
  });
});
