"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type ApprovalRequest = {
  id: string;
  sessionKey: string;
  tool: string;
  args: Record<string, unknown>;
  requestedAt: string;
};

export const ExecApprovalOverlay = () => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [resolving, setResolving] = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      const res = await fetch("/api/openclaw/approvals");
      const json = (await res.json()) as ApprovalRequest[];
      setApprovals(json);
    } catch {
      // silent — gateway may not support exec approval
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 3000);
    return () => {
      clearInterval(interval);
    };
  }, [fetchApprovals]);

  const handleResolve = async (
    id: string,
    action: "allow-once" | "allow-always" | "deny"
  ) => {
    setResolving(id);
    try {
      await fetch("/api/openclaw/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      setApprovals((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // error resolving
    } finally {
      setResolving(null);
    }
  };

  if (approvals.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg space-y-4">
        {approvals.map((approval) => (
          <div
            className="rounded-lg border border-yellow-500/50 bg-background p-6 shadow-2xl"
            key={approval.id}
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">&#x26A0;</span>
              <h3 className="text-lg font-semibold">Approval Required</h3>
              <Badge className="text-xs" variant="secondary">
                {approval.sessionKey}
              </Badge>
            </div>

            <div className="mb-4 space-y-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Tool
                </p>
                <p className="font-mono text-sm font-medium">{approval.tool}</p>
              </div>

              {Object.keys(approval.args).length > 0 ? (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Arguments
                  </p>
                  <pre className="mt-1 max-h-40 overflow-auto rounded bg-muted p-2 font-mono text-xs">
                    {JSON.stringify(approval.args, null, 2)}
                  </pre>
                </div>
              ) : null}

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Requested
                </p>
                <p className="font-mono text-xs">
                  {new Date(approval.requestedAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                disabled={resolving === approval.id}
                onClick={() => {
                  handleResolve(approval.id, "allow-once");
                }}
                type="button"
              >
                Allow Once
              </button>
              <button
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                disabled={resolving === approval.id}
                onClick={() => {
                  handleResolve(approval.id, "allow-always");
                }}
                type="button"
              >
                Allow Always
              </button>
              <button
                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                disabled={resolving === approval.id}
                onClick={() => {
                  handleResolve(approval.id, "deny");
                }}
                type="button"
              >
                Deny
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
