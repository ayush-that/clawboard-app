"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StepGuideProps = {
  title: string;
  steps: Array<{
    title: string;
    description: string;
  }>;
  difficulty?: string;
};

export const StepGuide = ({
  title,
  steps = [],
  difficulty,
}: StepGuideProps) => {
  return (
    <Card className="w-full border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {difficulty ? (
              <Badge
                className={`text-xs capitalize ${
                  difficulty === "beginner"
                    ? "text-emerald-400"
                    : difficulty === "advanced"
                      ? "text-red-400"
                      : "text-yellow-400"
                }`}
                variant="outline"
              >
                {difficulty}
              </Badge>
            ) : null}
            <Badge className="font-mono text-xs" variant="secondary">
              {steps.length} steps
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          <div className="absolute top-0 bottom-0 left-4 w-px bg-border" />

          {steps.map((step, stepNum) => (
            <div
              className="relative flex items-start gap-4 py-3"
              key={step.title}
            >
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card font-mono text-xs font-bold text-foreground">
                {stepNum + 1}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="font-medium text-sm">{step.title}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
