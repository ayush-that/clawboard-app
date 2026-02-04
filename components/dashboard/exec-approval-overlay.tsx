"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WarningIcon } from "../icons";

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
  const overlayRef = useRef<HTMLDivElement>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      const res = await fetch("/api/openclaw/approvals");
      const json = await res.json();
      setApprovals(Array.isArray(json) ? json : []);
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

  const handleResolve = useCallback(
    async (id: string, action: "allow-once" | "allow-always" | "deny") => {
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
    },
    []
  );

  // Focus trap and keyboard handling
  useEffect(() => {
    if (approvals.length === 0) {
      return;
    }

    const overlay = overlayRef.current;
    if (!overlay) {
      return;
    }

    // Focus the first button when overlay appears
    const firstButton = overlay.querySelector<HTMLButtonElement>("button");
    firstButton?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Dismiss by denying the first pending approval
        const first = approvals.at(0);
        if (first) {
          handleResolve(first.id, "deny");
        }
        return;
      }

      if (e.key !== "Tab") {
        return;
      }

      const focusable = overlay.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusable.length === 0) {
        return;
      }

      const firstEl = focusable.item(0);
      const lastEl = focusable.item(focusable.length - 1);

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [approvals, handleResolve]);

  if (approvals.length === 0) {
    return null;
  }

  return (
    <div
      aria-labelledby="exec-approval-heading"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      ref={overlayRef}
      role="dialog"
    >
      <div className="mx-4 w-full max-w-lg space-y-4">
        {approvals.map((approval) => (
          <Card className="border-yellow-500/50 shadow-2xl" key={approval.id}>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <WarningIcon size={16} />
                <h3
                  className="text-lg font-semibold"
                  id="exec-approval-heading"
                >
                  Approval Required
                </h3>
                <Badge className="text-xs" variant="secondary">
                  {approval.sessionKey}
                </Badge>
              </div>

              <div className="mb-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Tool</p>
                  <p className="font-mono text-sm font-medium">
                    {approval.tool}
                  </p>
                </div>

                {Object.keys(approval.args).length > 0 ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Arguments</p>
                    <pre className="mt-1 max-h-40 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
                      {JSON.stringify(approval.args, null, 2)}
                    </pre>
                  </div>
                ) : null}

                <div>
                  <p className="text-xs text-muted-foreground">Requested</p>
                  <p className="text-xs">
                    {new Date(approval.requestedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <Separator className="mb-4" />

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={resolving === approval.id}
                  onClick={() => {
                    handleResolve(approval.id, "allow-once");
                  }}
                  size="sm"
                  type="button"
                >
                  Allow Once
                </Button>
                <Button
                  className="flex-1"
                  disabled={resolving === approval.id}
                  onClick={() => {
                    handleResolve(approval.id, "allow-always");
                  }}
                  size="sm"
                  type="button"
                >
                  Allow Always
                </Button>
                <Button
                  className="flex-1"
                  disabled={resolving === approval.id}
                  onClick={() => {
                    handleResolve(approval.id, "deny");
                  }}
                  size="sm"
                  type="button"
                  variant="destructive"
                >
                  Deny
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
