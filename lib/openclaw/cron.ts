import type { GatewaySettings } from "./core";
import { invokeTool } from "./core";
import type { CronJobData } from "./types";

type CronDetails = {
  jobs: Array<{
    id?: string;
    name?: string;
    schedule?: string;
    enabled?: boolean;
    lastRun?: string;
    nextRun?: string;
    message?: string;
  }>;
};

const cronToJobs = (details: CronDetails): CronJobData[] =>
  details.jobs.map((j) => ({
    id: j.id ?? j.name ?? "unknown",
    name: j.name ?? j.id ?? "unnamed",
    schedule: j.schedule ?? "* * * * *",
    enabled: j.enabled ?? true,
    lastRun: j.lastRun,
    nextRun: j.nextRun,
    message: j.message,
    skill: "cron",
  }));

export const getCronJobs = async (
  cfg?: GatewaySettings
): Promise<CronJobData[]> => {
  try {
    const details = await invokeTool<CronDetails>(
      "cron",
      { action: "list" },
      cfg
    );
    return cronToJobs(details);
  } catch {
    return [];
  }
};

export const addCronJob = async (
  data: {
    name: string;
    schedule: string;
    message?: string;
  },
  cfg?: GatewaySettings
): Promise<{ success: boolean }> => {
  await invokeTool("cron", { action: "add", ...data }, cfg);
  return { success: true };
};

export const updateCronJob = async (
  id: string,
  patch: {
    name?: string;
    schedule?: string;
    message?: string;
    enabled?: boolean;
  },
  cfg?: GatewaySettings
): Promise<{ success: boolean }> => {
  await invokeTool("cron", { action: "update", id, ...patch }, cfg);
  return { success: true };
};

export const removeCronJob = async (
  id: string,
  cfg?: GatewaySettings
): Promise<{ success: boolean }> => {
  await invokeTool("cron", { action: "remove", id }, cfg);
  return { success: true };
};
