"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DataTableProps = {
  title: string;
  headers: string[];
  rows: string[][];
  caption?: string;
};

export const DataTable = ({
  title,
  headers = [],
  rows = [],
  caption,
}: DataTableProps) => {
  return (
    <Card className="w-full border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge className="font-mono text-xs" variant="secondary">
            {rows.length} rows
          </Badge>
        </div>
        {caption ? (
          <p className="text-xs text-muted-foreground">{caption}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                {headers.map((header) => (
                  <th
                    className="px-4 py-2.5 text-left font-mono text-xs font-medium text-muted-foreground"
                    key={header}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  className="border-b border-border/30 last:border-0 transition-colors hover:bg-muted/20"
                  key={row.join("|")}
                >
                  {row.map((cell) => (
                    <td className="px-4 py-2.5 text-sm" key={cell}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
