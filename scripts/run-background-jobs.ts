import { runAvailableJobs } from "../modules/jobs/application/job-runner";

const maxArg = process.argv.find((argument) => argument.startsWith("--max="));
const maxJobs = Math.max(1, Math.min(100, Number(maxArg?.split("=")[1] ?? 10) || 10));
const processed = await runAvailableJobs(maxJobs);
console.info(JSON.stringify({ event: "background_worker.finished", processed }));
