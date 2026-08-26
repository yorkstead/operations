import {
  FrontRangeDemoData,
  FRONT_RANGE_FIXTURE_DATA,
  FrontRangeDisruptionState,
} from "../domain/front-range-scenario";
import { SessionContext } from "../../core/domain/types";
import { activityService } from "../../core/application/activity-service";
import { authorizationService } from "../../core/application/authorization-service";

export class FrontRangeService {
  private scenarioData: FrontRangeDemoData = { ...FRONT_RANGE_FIXTURE_DATA };

  // 1. Get Complete Front Range Scenario Data
  getFrontRangeScenario(): FrontRangeDemoData {
    return this.scenarioData;
  }

  // 2. Trigger Recoverable Disruption
  triggerDisruption(session: SessionContext): FrontRangeDisruptionState {
    authorizationService.requireCapability(session, "jobs:update_status");

    this.scenarioData.disruption.isDisrupted = true;
    this.scenarioData.disruption.resolvedAt = undefined;

    activityService.logActivity({
      organizationId: this.scenarioData.organization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "system",
      entityId: this.scenarioData.disruption.assetTag,
      action: "maintenance.disruption_triggered",
      summary: `Triggered simulation disruption: ${this.scenarioData.disruption.title} on ${this.scenarioData.disruption.assetTag}.`,
    });

    return this.scenarioData.disruption;
  }

  // 3. Resolve Recoverable Disruption
  resolveDisruption(session: SessionContext): FrontRangeDisruptionState {
    authorizationService.requireCapability(session, "quality:manage_schedules");

    const now = new Date().toISOString();
    this.scenarioData.disruption.isDisrupted = false;
    this.scenarioData.disruption.resolvedAt = now;

    activityService.logActivity({
      organizationId: this.scenarioData.organization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "system",
      entityId: this.scenarioData.disruption.assetTag,
      action: "maintenance.disruption_resolved",
      summary: `Resolved simulation disruption: ${this.scenarioData.disruption.correctiveAction}. Asset restored to operational.`,
    });

    return this.scenarioData.disruption;
  }
}

export const frontRangeService = new FrontRangeService();
