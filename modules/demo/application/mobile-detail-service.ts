import {
  MobileDetailDemoData,
  MOBILE_DETAIL_FIXTURE_DATA,
  DetailAppointment,
} from "../domain/mobile-detail-scenario";
import { SessionContext } from "../../core/domain/types";
import { activityService } from "../../core/application/activity-service";
import { authorizationService } from "../../core/application/authorization-service";

export class MobileDetailService {
  private scenarioData: MobileDetailDemoData = { ...MOBILE_DETAIL_FIXTURE_DATA };

  // 1. Get Complete Mobile Detail Scenario
  getMobileDetailScenario(): MobileDetailDemoData {
    return this.scenarioData;
  }

  // 2. Toggle Checklist Item
  toggleChecklistItem(session: SessionContext, itemId: string): DetailAppointment {
    authorizationService.requireCapability(session, "jobs:update_status");

    const appointment = this.scenarioData.appointment;
    const item = appointment.checklist.find((c) => c.id === itemId);
    if (!item) throw new Error(`Checklist item '${itemId}' not found.`);

    item.isCompleted = !item.isCompleted;

    activityService.logActivity({
      organizationId: this.scenarioData.organization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: appointment.id,
      action: "detailing.checklist_updated",
      summary: `Detail checklist item "${item.description}" updated to ${item.isCompleted ? "COMPLETED" : "PENDING"}.`,
    });

    return appointment;
  }

  // 3. Approve On-Site Add-On
  approveAddOn(session: SessionContext, addOnId: string, clientName: string): DetailAppointment {
    authorizationService.requireCapability(session, "quoting:approve_margin");

    const appointment = this.scenarioData.appointment;
    const addOn = appointment.addOns.find((a) => a.id === addOnId);
    if (!addOn) throw new Error(`Add-on '${addOnId}' not found.`);

    addOn.isApproved = true;
    addOn.approvedBy = `${clientName} (via client consent)`;
    addOn.approvedAt = new Date().toISOString();

    // Recalculate total
    const totalApprovedAddOns = appointment.addOns
      .filter((a) => a.isApproved)
      .reduce((sum, a) => sum + a.priceCents, 0);

    appointment.payment.amountCents = appointment.basePriceCents + totalApprovedAddOns;

    activityService.logActivity({
      organizationId: this.scenarioData.organization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: appointment.id,
      action: "detailing.addon_approved",
      summary: `Approved on-site add-on "${addOn.name}" ($${(addOn.priceCents / 100).toFixed(2)}). Total updated to $${(appointment.payment.amountCents / 100).toFixed(2)}.`,
    });

    return appointment;
  }

  // 4. Complete Mobile Detail Appointment & Capture Simulated Payment
  completeAppointment(session: SessionContext, cardLast4: string): DetailAppointment {
    authorizationService.requireCapability(session, "quality:manage_schedules");

    const appointment = this.scenarioData.appointment;
    appointment.status = "completed";
    appointment.payment.status = "simulated_captured";
    appointment.payment.cardLast4 = cardLast4;
    appointment.payment.timestamp = new Date().toISOString();

    activityService.logActivity({
      organizationId: this.scenarioData.organization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: appointment.id,
      action: "detailing.appointment_completed",
      summary: `Completed detailing appointment ${appointment.appointmentNumber} for ${appointment.vehicle.year} ${appointment.vehicle.make} ${appointment.vehicle.model}. Intercepted simulated card charge of $${(appointment.payment.amountCents / 100).toFixed(2)}.`,
    });

    return appointment;
  }
}

export const mobileDetailService = new MobileDetailService();
