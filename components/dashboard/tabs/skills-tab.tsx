"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

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

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch("/api/openclaw/skills");
        const json = (await res.json()) as SkillItem[];
        setSkills(json);
      } catch {
        setSkills([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">Loading skills...</p>
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-12">
        <p className="text-sm text-muted-foreground">No skills found</p>
        <p className="text-xs text-muted-foreground">
          Install skills via{" "}
          <code className="rounded bg-muted px-1 py-0.5">
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
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Skills</h2>
        <span className="text-xs text-muted-foreground">
          {skills.length} skills
        </span>
      </div>

      {[...grouped.entries()].map(([source, items]) => (
        <div key={source}>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-sm font-medium capitalize">{source}</h3>
            <Badge className="text-xs" variant="outline">
              {items.length}
            </Badge>
          </div>
          <div className="space-y-1">
            {items.map((skill) => (
              <div
                className="flex items-start gap-3 rounded-md border border-border/30 p-3"
                key={skill.name}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      {skill.name}
                    </span>
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
                  {skill.description ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {skill.description}
                    </p>
                  ) : null}
                  {skill.path ? (
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {skill.path}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="border-t border-border/30 pt-4">
        <p className="text-xs text-muted-foreground">
          Browse and install more skills from{" "}
          <a
            className="text-primary underline"
            href="https://clawhub.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            ClawHub
          </a>
        </p>
      </div>
    </div>
  );
};
