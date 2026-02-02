"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type CronJob = {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  message?: string;
  skill: string;
};

type NewJobForm = {
  name: string;
  schedule: string;
  message: string;
};

const emptyForm: NewJobForm = { name: "", schedule: "", message: "" };

export const CronTab = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewJobForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<NewJobForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/openclaw/cron");
      const json = (await res.json()) as CronJob[];
      setJobs(json);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.schedule.trim()) {
      return;
    }
    setSaving(true);
    try {
      await fetch("/api/openclaw/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      setShowForm(false);
      await fetchJobs();
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (job: CronJob) => {
    try {
      await fetch("/api/openclaw/cron", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.id, enabled: !job.enabled }),
      });
      await fetchJobs();
    } catch {
      // silent fail
    }
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    try {
      await fetch("/api/openclaw/cron", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editForm }),
      });
      setEditingId(null);
      await fetchJobs();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch("/api/openclaw/cron", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await fetchJobs();
    } catch {
      // silent fail
    }
  };

  const startEdit = (job: CronJob) => {
    setEditingId(job.id);
    setEditForm({
      name: job.name,
      schedule: job.schedule,
      message: job.message ?? "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">Loading cron jobs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Cron Jobs</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {jobs.length} jobs
          </span>
          <button
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={() => {
              setShowForm(!showForm);
            }}
            type="button"
          >
            {showForm ? "Cancel" : "New Job"}
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="rounded-md border border-border/50 p-3 space-y-2">
          <input
            className="w-full rounded-md border border-border/50 bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
            }}
            placeholder="Job name"
            type="text"
            value={form.name}
          />
          <input
            className="w-full rounded-md border border-border/50 bg-background px-3 py-1.5 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            onChange={(e) => {
              setForm({ ...form, schedule: e.target.value });
            }}
            placeholder="Schedule (e.g. */5 * * * * or every 30m)"
            type="text"
            value={form.schedule}
          />
          <textarea
            className="w-full rounded-md border border-border/50 bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            onChange={(e) => {
              setForm({ ...form, message: e.target.value });
            }}
            placeholder="Message to send the agent"
            rows={2}
            value={form.message}
          />
          <button
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            disabled={saving || !form.name.trim() || !form.schedule.trim()}
            onClick={handleCreate}
            type="button"
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      ) : null}

      {jobs.length === 0 && !showForm ? (
        <div className="flex items-center justify-center p-12">
          <p className="text-sm text-muted-foreground">
            No cron jobs configured
          </p>
        </div>
      ) : null}

      {jobs.map((job) => (
        <div className="rounded-md border border-border/30 p-3" key={job.id}>
          {editingId === job.id ? (
            <div className="space-y-2">
              <input
                className="w-full rounded-md border border-border/50 bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                onChange={(e) => {
                  setEditForm({ ...editForm, name: e.target.value });
                }}
                type="text"
                value={editForm.name}
              />
              <input
                className="w-full rounded-md border border-border/50 bg-background px-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                onChange={(e) => {
                  setEditForm({ ...editForm, schedule: e.target.value });
                }}
                type="text"
                value={editForm.schedule}
              />
              <textarea
                className="w-full rounded-md border border-border/50 bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                onChange={(e) => {
                  setEditForm({ ...editForm, message: e.target.value });
                }}
                rows={2}
                value={editForm.message}
              />
              <div className="flex gap-2">
                <button
                  className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  disabled={saving}
                  onClick={() => {
                    handleUpdate(job.id);
                  }}
                  type="button"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setEditingId(null);
                  }}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    className={`h-4 w-8 rounded-full transition-colors ${job.enabled ? "bg-emerald-500" : "bg-muted"}`}
                    onClick={() => {
                      handleToggle(job);
                    }}
                    title={job.enabled ? "Disable" : "Enable"}
                    type="button"
                  >
                    <span
                      className={`block h-3 w-3 rounded-full bg-white transition-transform ${job.enabled ? "translate-x-4" : "translate-x-0.5"}`}
                    />
                  </button>
                  <span className="font-mono text-sm font-medium">
                    {job.name}
                  </span>
                  <Badge
                    className="text-xs"
                    variant={job.enabled ? "default" : "secondary"}
                  >
                    {job.enabled ? "active" : "disabled"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Badge className="font-mono text-xs" variant="outline">
                    {job.schedule}
                  </Badge>
                  <button
                    className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => {
                      startEdit(job);
                    }}
                    title="Edit"
                    type="button"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    className="rounded p-1 text-muted-foreground transition-colors hover:text-red-400"
                    onClick={() => {
                      handleDelete(job.id);
                    }}
                    title="Delete"
                    type="button"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
              {job.message ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {job.message}
                </p>
              ) : null}
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
            </>
          )}
        </div>
      ))}
    </div>
  );
};
