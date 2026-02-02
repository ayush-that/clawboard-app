"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MarkdownCardProps = {
  title: string;
  sections: Array<{
    heading?: string;
    content: string;
  }>;
  category?: string;
};

export const MarkdownCard = ({
  title,
  sections = [],
  category,
}: MarkdownCardProps) => {
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
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.heading ?? section.content.slice(0, 40)}>
              {section.heading ? (
                <h3 className="mb-1.5 font-semibold text-sm text-foreground">
                  {section.heading}
                </h3>
              ) : null}
              <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
