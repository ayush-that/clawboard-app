"use client";

import { useCallback, useEffect, useState } from "react";
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
          <Card className="border-yellow-500/50 shadow-2xl" key={approval.id}>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <WarningIcon size={16} />
                <h3 className="text-lg font-semibold">Approval Required</h3>
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
