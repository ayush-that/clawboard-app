"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type CronJob = {
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  skill: string;
};

export const CronTab = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/openclaw/cron");
        const json = (await res.json()) as CronJob[];
        setJobs(json);
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">Loading cron jobs...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">No cron jobs configured</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Cron Jobs</h2>
        <span className="text-xs text-muted-foreground">
          {jobs.length} jobs
        </span>
      </div>
      {jobs.map((job) => (
        <div className="rounded-md border border-border/30 p-3" key={job.name}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium">{job.name}</span>
              <Badge
                className="text-xs"
                variant={job.enabled ? "default" : "secondary"}
              >
                {job.enabled ? "active" : "disabled"}
              </Badge>
            </div>
            <Badge className="font-mono text-xs" variant="outline">
              {job.schedule}
            </Badge>
          </div>
          <div className="mt-1.5 flex gap-4 font-mono text-xs text-muted-foreground">
            {job.lastRun ? (
              <span>
                Last:{" "}
                {new Date(job.lastRun).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            ) : null}
            {job.nextRun ? (
              <span>
                Next:{" "}
                {new Date(job.nextRun).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};
