import {
  SummitFacilityDemoData,
  SUMMIT_FACILITY_FIXTURE_DATA,
  ServiceJobRelease,
  ServiceException,
} from "../domain/summit-facility-scenario";
import { SessionContext } from "../../core/domain/types";
import { activityService } from "../../core/application/activity-service";
import { authorizationService } from "../../core/application/authorization-service";

export class SummitFacilityService {
  private scenarioData: SummitFacilityDemoData = { ...SUMMIT_FACILITY_FIXTURE_DATA };

  // 1. Get Complete Scenario Data
  getSummitScenario(): SummitFacilityDemoData {
    return this.scenarioData;
  }

  // 2. Toggle Checklist Item Completion
  toggleChecklistItem(session: SessionContext, jobId: string, checklistItemId: string): ServiceJobRelease {
    authorizationService.requireCapability(session, "jobs:update_status");

    const job = this.scenarioData.jobs.find((j) => j.id === jobId);
    if (!job) throw new Error(`Service job '${jobId}' not found.`);

    const item = job.checklist.find((c) => c.id === checklistItemId);
    if (!item) throw new Error(`Checklist item '${checklistItemId}' not found.`);

    item.isCompleted = !item.isCompleted;

    activityService.logActivity({
      organizationId: this.scenarioData.organization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: job.id,
      action: "facility.checklist_item_updated",
      summary: `Checklist item "${item.description}" updated to ${item.isCompleted ? "COMPLETED" : "PENDING"}.`,
    });

    return job;
  }

  // 3. Complete Service Job with Client Signoff
  completeServiceJob(session: SessionContext, jobId: string, clientSignoffName: string): ServiceJobRelease {
    authorizationService.requireCapability(session, "quality:manage_schedules");

    const job = this.scenarioData.jobs.find((j) => j.id === jobId);
    if (!job) throw new Error(`Service job '${jobId}' not found.`);

    const now = new Date().toISOString();
    job.status = "completed";
    job.proofOfWork.clientSignoffName = clientSignoffName;
    job.proofOfWork.signoffTimestamp = now;

    activityService.logActivity({
      organizationId: this.scenarioData.organization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: job.id,
      action: "facility.service_job_completed",
      summary: `Service job ${job.jobNumber} completed at ${job.siteName} with signoff by ${clientSignoffName}.`,
    });

    return job;
  }

  // 4. Report Service Exception
  reportException(
    session: SessionContext,
    params: { jobId: string; exceptionType: ServiceException["exceptionType"]; severity: ServiceException["severity"]; description: string }
  ): ServiceException {
    authorizationService.requireCapability(session, "jobs:update_status");

    const job = this.scenarioData.jobs.find((j) => j.id === params.jobId);
    const siteName = job ? job.siteName : "Unknown Facility Site";

    const exception: ServiceException = {
      id: `exc_${Date.now()}`,
      jobId: params.jobId,
      siteName,
      exceptionType: params.exceptionType,
      severity: params.severity,
      description: params.description,
      status: "open",
      reportedAt: new Date().toISOString(),
    };

    this.scenarioData.exceptions.unshift(exception);

    activityService.logActivity({
      organizationId: this.scenarioData.organization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: exception.id,
      action: "facility.exception_reported",
      summary: `Reported ${exception.severity} exception "${exception.description}" at ${siteName}.`,
    });

    return exception;
  }

  // 5. Resolve Exception
  resolveException(session: SessionContext, exceptionId: string, resolutionAction: string): ServiceException {
    authorizationService.requireCapability(session, "quality:manage_schedules");

    const exception = this.scenarioData.exceptions.find((e) => e.id === exceptionId);
    if (!exception) throw new Error(`Exception '${exceptionId}' not found.`);

    exception.status = "resolved";
    exception.resolvedAt = new Date().toISOString();
    exception.resolutionAction = resolutionAction;

    activityService.logActivity({
      organizationId: this.scenarioData.organization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: exception.id,
      action: "facility.exception_resolved",
      summary: `Resolved facility exception "${exception.description}": ${resolutionAction}.`,
    });

    return exception;
  }
}

export const summitFacilityService = new SummitFacilityService();
