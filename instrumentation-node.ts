import { applicationMetadata } from "@/lib/infrastructure/observability/app-metadata";
import { logger } from "@/lib/infrastructure/observability/logger";

logger.info("application.startup", "Application runtime started", {
  service: applicationMetadata.service,
  version: applicationMetadata.version,
  runtimeRole: process.env.RUNTIME_ROLE ?? "web",
});

process.once("beforeExit", () => {
  logger.info("application.shutdown", "Application runtime stopping", {
    service: applicationMetadata.service,
    version: applicationMetadata.version,
    runtimeRole: process.env.RUNTIME_ROLE ?? "web",
  });
});
