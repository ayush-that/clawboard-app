"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type InfoCardProps = {
  title: string;
  description: string;
  details: Array<{
    label: string;
    value: string;
  }>;
  category?: string;
};

export const InfoCard = ({
  title,
  description,
  details = [],
  category,
}: InfoCardProps) => {
  return (
    <Card className="w-full border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {category ? (
            <Badge className="text-xs capitalize" variant="secondary">
              {category}
            </Badge>
          ) : null}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardHeader>
      {details.length > 0 ? (
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {details.map((detail) => (
              <div
                className="rounded-lg border border-border/30 bg-background/50 px-3 py-2"
                key={detail.label}
              >
                <p className="font-mono text-xs text-muted-foreground">
                  {detail.label}
                </p>
                <p className="mt-0.5 text-sm font-medium">{detail.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
};
