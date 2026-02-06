"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SkillItem = {
  name: string;
  description: string;
  enabled: boolean;
  source: string;
  path?: string;
};

const sourceColors: Record<string, string> = {
  workspace: "text-blue-400",
  "built-in": "text-emerald-400",
  installed: "text-purple-400",
  config: "text-yellow-400",
};

export const SkillsTab = () => {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    try {
      const res = await fetch("/api/openclaw/skills");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message ?? json.error ?? "Request failed");
      }
      setSkills(Array.isArray(json) ? json : []);
      setError(null);
    } catch (error) {
      console.error("Failed to load skills:", error);
      setError("Failed to load skills. Check gateway connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  if (loading) {
    return null;
  }

  if (error && skills.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 p-4 md:p-6">
        <h2 className="text-xl font-semibold">Skills</h2>
        <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <span>{error}</span>
          <Button
            className="ml-4 h-7 px-2.5 text-xs"
            onClick={fetchSkills}
            size="sm"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 p-4 md:p-6">
        <h2 className="text-xl font-semibold">Skills</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
            <p className="text-sm text-muted-foreground">No skills found</p>
            <p className="text-xs text-muted-foreground">
              Install skills via{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                npx clawhub install &lt;skill&gt;
              </code>{" "}
              or browse{" "}
              <a
                className="text-primary underline"
                href="https://clawhub.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                ClawHub
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group by source
  const grouped = new Map<string, SkillItem[]>();
  for (const skill of skills) {
    const source = skill.source || "other";
    const existing = grouped.get(source) ?? [];
    existing.push(skill);
    grouped.set(source, existing);
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
      <h2 className="text-xl font-semibold">Skills</h2>

      {error ? (
        <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <span>{error}</span>
          <Button
            className="ml-4 h-7 px-2.5 text-xs"
            onClick={fetchSkills}
            size="sm"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      ) : null}

      {[...grouped.entries()].map(([source, items]) => (
        <div key={source}>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-sm font-medium capitalize">{source}</h3>
            <Badge className="text-xs" variant="outline">
              {items.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {items.map((skill) => (
              <Card key={skill.name}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{skill.name}</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <Badge
                        className={`text-xs ${sourceColors[source] ?? ""}`}
                        variant="outline"
                      >
                        {source}
                      </Badge>
                      <Badge
                        className="text-xs"
                        variant={skill.enabled ? "default" : "secondary"}
                      >
                        {skill.enabled ? "enabled" : "disabled"}
                      </Badge>
                    </div>
                  </div>
                  {skill.description ? (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {skill.description}
                    </p>
                  ) : null}
                  {skill.path ? (
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {skill.path}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
