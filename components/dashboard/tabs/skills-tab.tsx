"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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

const LoadingSkeleton = () => (
  <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-4 w-16" />
    </div>
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton className="h-16 w-full rounded-lg" key={`skel-${String(i)}`} />
    ))}
  </div>
);

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
    return <LoadingSkeleton />;
  }

  if (skills.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
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
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Skills</h2>
        <span className="text-xs text-muted-foreground">
          {skills.length} skills
        </span>
      </div>

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

      <Separator />
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
  );
};
