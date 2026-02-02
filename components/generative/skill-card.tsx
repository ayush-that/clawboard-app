"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SkillCardProps = {
  skills: Array<{
    name: string;
    description: string;
    enabled: boolean;
    lastUsed?: string;
  }>;
};

const formatTimeAgo = (isoDate?: string): string => {
  if (!isoDate) {
    return "never";
  }
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${Math.floor(hours / 24)}d ago`;
};

export const SkillCard = ({ skills = [] }: SkillCardProps) => {
  const enabledCount = skills.filter((s) => s.enabled).length;

  return (
    <Card className="w-full border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Installed Skills</CardTitle>
          <Badge className="font-mono text-xs" variant="secondary">
            {enabledCount}/{skills.length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {skills.map((skill) => (
            <div
              className={`rounded-lg border p-3 transition-colors ${
                skill.enabled
                  ? "border-border/50 bg-background/50"
                  : "border-border/30 bg-muted/30 opacity-60"
              }`}
              key={skill.name}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-medium">
                  {skill.name}
                </span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    skill.enabled ? "bg-emerald-500" : "bg-muted-foreground/40"
                  }`}
                />
              </div>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                {skill.description}
              </p>
              <p className="text-muted-foreground mt-1.5 font-mono text-xs">
                Last used: {formatTimeAgo(skill.lastUsed)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
