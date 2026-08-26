import {
  SignworksDemoData,
  SIGNWORKS_FIXTURE_DATA,
  SignworksProject,
} from "../domain/signworks-scenario";
import { SessionContext } from "../../core/domain/types";
import { activityService } from "../../core/application/activity-service";
import { authorizationService } from "../../core/application/authorization-service";

export class SignworksService {
  private scenarioData: SignworksDemoData = { ...SIGNWORKS_FIXTURE_DATA };

  // 1. Get Complete Signworks Scenario Data
  getSignworksScenario(): SignworksDemoData {
    return this.scenarioData;
  }

  // 2. Approve Artwork Revision
  approveArtworkRevision(session: SessionContext, revisionCode: string, approverName: string): SignworksProject {
    authorizationService.requireCapability(session, "jobs:update_status");

    const project = this.scenarioData.project;
    project.currentRevision.status = "client_approved";
    project.currentRevision.approvalName = approverName;
    project.currentRevision.approvalTimestamp = new Date().toISOString();
    project.status = "design_approved";

    activityService.logActivity({
      organizationId: this.scenarioData.organization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: project.id,
      action: "signage.artwork_approved",
      summary: `Approved production artwork ${revisionCode} for project ${project.projectNumber} by ${approverName}.`,
    });

    return project;
  }

  // 3. Complete Field Installation
  completeFieldInstallation(
    session: SessionContext,
    params: { clientSignoffName: string; proofPhotoCount: number }
  ): SignworksProject {
    authorizationService.requireCapability(session, "quality:manage_schedules");

    const project = this.scenarioData.project;
    project.fieldInstallation.isMounted = true;
    project.fieldInstallation.isElectricalConnected = true;
    project.fieldInstallation.proofPhotosCount = params.proofPhotoCount;
    project.fieldInstallation.clientSignoffName = params.clientSignoffName;
    project.status = "completed";

    activityService.logActivity({
      organizationId: this.scenarioData.organization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: project.id,
      action: "signage.installation_completed",
      summary: `Field crane installation completed and signed off for ${project.clientName}.`,
    });

    return project;
  }
}

export const signworksService = new SignworksService();
