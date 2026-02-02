"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProConListProps = {
  title: string;
  pros: Array<{
    point: string;
    detail?: string;
  }>;
  cons: Array<{
    point: string;
    detail?: string;
  }>;
  verdict?: string;
};

export const ProConList = ({
  title,
  pros = [],
  cons = [],
  verdict,
}: ProConListProps) => {
  return (
    <Card className="w-full border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Pros */}
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-sm text-emerald-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-xs">
                +
              </span>
              Pros
            </h4>
            <ul className="space-y-2">
              {pros.map((pro) => (
                <li className="text-sm" key={pro.point}>
                  <span className="font-medium">{pro.point}</span>
                  {pro.detail ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {pro.detail}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-sm text-red-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-xs">
                -
              </span>
              Cons
            </h4>
            <ul className="space-y-2">
              {cons.map((con) => (
                <li className="text-sm" key={con.point}>
                  <span className="font-medium">{con.point}</span>
                  {con.detail ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {con.detail}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {verdict ? (
          <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-sm">
              <span className="font-semibold">Verdict: </span>
              <span className="text-muted-foreground">{verdict}</span>
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
