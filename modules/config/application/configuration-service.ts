import {
  OrganizationConfiguration,
  ConfigurationHistoryRecord,
  ModuleKey,
  DEFAULT_ORG_CONFIG,
} from "../domain/types";
import { SessionContext } from "../../core/domain/types";
import { authorizationService } from "../../core/application/authorization-service";
import { activityService } from "../../core/application/activity-service";

export class ModuleDisabledError extends Error {
  public readonly moduleKey: ModuleKey;

  constructor(moduleKey: ModuleKey) {
    super(`Module '${moduleKey}' is not enabled for this organization.`);
    this.name = "ModuleDisabledError";
    this.moduleKey = moduleKey;
  }
}

export class ConfigurationService {
  private configs: Map<string, OrganizationConfiguration> = new Map();
  private history: Map<string, ConfigurationHistoryRecord[]> = new Map();

  getConfiguration(session: SessionContext): OrganizationConfiguration {
    if (!session || !session.activeOrganization) {
      throw new Error("Active organization session required.");
    }

    const orgId = session.activeOrganization.id;
    let config = this.configs.get(orgId);

    if (!config) {
      const now = new Date().toISOString();
      config = {
        ...DEFAULT_ORG_CONFIG,
        id: `cfg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        organizationId: orgId,
        updatedByUserId: session.user.id,
        updatedAt: now,
      };
      this.configs.set(orgId, config);

      const initialHistory: ConfigurationHistoryRecord = {
        id: `cfg_hist_${Date.now()}`,
        organizationId: orgId,
        version: 1,
        configSnapshot: JSON.parse(JSON.stringify(config)),
        changeReason: "Initial organization configuration baseline.",
        updatedByUserId: session.user.id,
        updatedAt: now,
      };
      this.history.set(orgId, [initialHistory]);
    }

    return config;
  }

  assertModuleEnabled(session: SessionContext, moduleKey: ModuleKey): void {
    const config = this.getConfiguration(session);
    if (!config.entitlements[moduleKey]) {
      throw new ModuleDisabledError(moduleKey);
    }
  }

  updateConfiguration(
    session: SessionContext,
    updates: Partial<Omit<OrganizationConfiguration, "id" | "organizationId" | "version" | "updatedByUserId" | "updatedAt">>,
    changeReason: string
  ): OrganizationConfiguration {
    authorizationService.requireCapability(session, "org:manage_profile");

    const currentConfig = this.getConfiguration(session);
    const orgId = session.activeOrganization.id;

    // Invariant Validation
    if (updates.workflow && updates.workflow.defaultLaborRatePerHour <= 0) {
      throw new Error("Default labor rate per hour must be greater than zero.");
    }

    const newVersion = currentConfig.version + 1;
    const now = new Date().toISOString();

    const updatedConfig: OrganizationConfiguration = {
      ...currentConfig,
      ...updates,
      version: newVersion,
      updatedByUserId: session.user.id,
      updatedAt: now,
    };

    this.configs.set(orgId, updatedConfig);

    const historyRecord: ConfigurationHistoryRecord = {
      id: `cfg_hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: orgId,
      version: newVersion,
      configSnapshot: JSON.parse(JSON.stringify(updatedConfig)),
      changeReason: changeReason.trim() || `Configuration updated to v${newVersion}.`,
      updatedByUserId: session.user.id,
      updatedAt: now,
    };

    const histList = this.history.get(orgId) || [];
    histList.unshift(historyRecord);
    this.history.set(orgId, histList);

    activityService.logActivity({
      organizationId: orgId,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: orgId,
      action: "config.updated",
      summary: `Organization configuration updated to v${newVersion}: ${historyRecord.changeReason}`,
    });

    return updatedConfig;
  }

  rollbackConfiguration(
    session: SessionContext,
    targetVersion: number,
    rollbackReason: string
  ): OrganizationConfiguration {
    authorizationService.requireCapability(session, "org:manage_profile");

    const orgId = session.activeOrganization.id;
    const histList = this.history.get(orgId) || [];
    const target = histList.find((h) => h.version === targetVersion);

    if (!target) {
      throw new Error(`Target configuration version v${targetVersion} not found in history.`);
    }

    return this.updateConfiguration(
      session,
      {
        entitlements: target.configSnapshot.entitlements,
        terminology: target.configSnapshot.terminology,
        workflow: target.configSnapshot.workflow,
        theme: target.configSnapshot.theme,
      },
      `Rollback to v${targetVersion}: ${rollbackReason}`
    );
  }

  listHistory(session: SessionContext): ConfigurationHistoryRecord[] {
    const orgId = session.activeOrganization.id;
    return this.history.get(orgId) || [];
  }
}

export const configurationService = new ConfigurationService();
