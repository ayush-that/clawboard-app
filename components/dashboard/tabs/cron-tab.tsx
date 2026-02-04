"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

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
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/openclaw/cron");
      const json = await res.json();
      setJobs(Array.isArray(json) ? json : []);
      setError(null);
    } catch {
      setError("Failed to load cron jobs. Check gateway connection.");
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
      const res = await fetch("/api/openclaw/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        setError("Failed to create cron job.");
        return;
      }
      setError(null);
      setForm(emptyForm);
      setShowForm(false);
      await fetchJobs();
    } catch {
      setError("Failed to create cron job. Check gateway connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (job: CronJob) => {
    try {
      const res = await fetch("/api/openclaw/cron", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.id, enabled: !job.enabled }),
      });
      if (!res.ok) {
        setError("Failed to toggle cron job.");
        return;
      }
      setError(null);
      await fetchJobs();
    } catch {
      setError("Failed to toggle cron job. Check gateway connection.");
    }
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/openclaw/cron", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editForm }),
      });
      if (!res.ok) {
        setError("Failed to update cron job.");
        return;
      }
      setError(null);
      setEditingId(null);
      await fetchJobs();
    } catch {
      setError("Failed to update cron job. Check gateway connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/openclaw/cron", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        setError("Failed to delete cron job.");
        return;
      }
      setError(null);
      await fetchJobs();
    } catch {
      setError("Failed to delete cron job. Check gateway connection.");
    } finally {
      setDeleteTarget(null);
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
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">Cron Jobs</h2>
          <Badge className="text-xs" variant="outline">
            {jobs.length}
          </Badge>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
          }}
          size="sm"
          variant={showForm ? "ghost" : "default"}
        >
          {showForm ? "Cancel" : "New Job"}
        </Button>
      </div>

      {error ? (
        <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <span>{error}</span>
          <Button
            className="ml-4 h-7 px-2.5 text-xs"
            onClick={fetchJobs}
            size="sm"
            variant="ghost"
          >
            Retry
          </Button>
        </div>
      ) : null}

      {showForm ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <Input
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
              }}
              placeholder="Job name"
              value={form.name}
            />
            <Input
              className="font-mono"
              onChange={(e) => {
                setForm({ ...form, schedule: e.target.value });
              }}
              placeholder="Schedule (e.g. */5 * * * * or every 30m)"
              value={form.schedule}
            />
            <Textarea
              onChange={(e) => {
                setForm({ ...form, message: e.target.value });
              }}
              placeholder="Message to send the agent"
              rows={2}
              value={form.message}
            />
            <Button
              disabled={saving || !form.name.trim() || !form.schedule.trim()}
              onClick={handleCreate}
              size="sm"
            >
              {saving ? "Creating..." : "Create"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {jobs.length === 0 && !showForm ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              No cron jobs configured
            </p>
          </CardContent>
        </Card>
      ) : null}

      {jobs.map((job) => (
        <Card key={job.id}>
          <CardContent className="p-4">
            {editingId === job.id ? (
              <div className="space-y-3">
                <Input
                  onChange={(e) => {
                    setEditForm({ ...editForm, name: e.target.value });
                  }}
                  value={editForm.name}
                />
                <Input
                  className="font-mono"
                  onChange={(e) => {
                    setEditForm({ ...editForm, schedule: e.target.value });
                  }}
                  value={editForm.schedule}
                />
                <Textarea
                  onChange={(e) => {
                    setEditForm({ ...editForm, message: e.target.value });
                  }}
                  rows={2}
                  value={editForm.message}
                />
                <div className="flex gap-2">
                  <Button
                    disabled={saving}
                    onClick={() => {
                      handleUpdate(job.id);
                    }}
                    size="sm"
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingId(null);
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      aria-checked={job.enabled}
                      aria-label={`${job.enabled ? "Disable" : "Enable"} ${job.name}`}
                      className={`h-5 w-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${job.enabled ? "bg-emerald-500" : "bg-muted"}`}
                      onClick={() => {
                        handleToggle(job);
                      }}
                      role="switch"
                      type="button"
                    >
                      <span
                        className={`block h-3.5 w-3.5 rounded-full bg-white transition-transform ${job.enabled ? "translate-x-4.5" : "translate-x-0.5"}`}
                      />
                    </button>
                    <span className="text-sm font-medium">{job.name}</span>
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
                    <Button
                      className="h-7 w-7"
                      onClick={() => {
                        startEdit(job);
                      }}
                      size="icon-sm"
                      title="Edit"
                      variant="ghost"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <title>Edit job</title>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Button>
                    <Button
                      className="h-7 w-7 hover:text-red-400"
                      onClick={() => {
                        setDeleteTarget(job.id);
                      }}
                      size="icon-sm"
                      title="Delete"
                      variant="ghost"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <title>Delete job</title>
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </Button>
                  </div>
                </div>
                {job.message ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {job.message}
                  </p>
                ) : null}
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
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
          </CardContent>
        </Card>
      ))}

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        open={deleteTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete cron job?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The cron job will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  handleDelete(deleteTarget);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
