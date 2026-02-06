import type { GatewaySettings } from "./core";
import {
  chatCompletions,
  chatCronAdd,
  chatCronList,
  chatCronRemove,
} from "./core";
import type { CronJobData } from "./types";

export const getCronJobs = async (
  cfg?: GatewaySettings
): Promise<CronJobData[]> => {
  const jobs = await chatCronList(cfg);
  return jobs.map((j) => ({
    id: j.id ?? j.name ?? "unknown",
    name: j.name ?? j.id ?? "unnamed",
    schedule: j.schedule ?? "* * * * *",
    enabled: j.enabled ?? true,
    lastRun: j.lastRun,
    nextRun: j.nextRun,
    message: j.message,
    skill: "cron",
  }));
};

export const addCronJob = async (
  data: {
    name: string;
    schedule: string;
    message?: string;
  },
  cfg?: GatewaySettings
): Promise<{ success: boolean }> => {
  return await chatCronAdd(data, cfg);
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
  const patchStr = JSON.stringify(patch, null, 2);
  const { success } = await chatCompletions(
    `Update the scheduled/cron job "${id}" with the following changes:\n${patchStr}\nConfirm with "done" when updated.`,
    cfg
  );
  return { success };
};

export const removeCronJob = async (
  id: string,
  cfg?: GatewaySettings
): Promise<{ success: boolean }> => {
  return await chatCronRemove(id, cfg);
};
