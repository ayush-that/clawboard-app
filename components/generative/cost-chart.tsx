"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CostChartProps = {
  data: Array<{
    date: string;
    tokens: number;
    cost: number;
    model: string;
  }>;
  chartType: "line" | "bar";
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: { date: string; tokens: number; cost: number; model: string };
  }>;
}) => {
  if (!active || !payload?.length) {
    return null;
  }
  const data = payload.at(0)?.payload;
  if (!data) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border/50 bg-popover p-3 shadow-lg">
      <p className="font-mono text-xs font-medium">{data.date}</p>
      <p className="text-sm">
        <span className="text-muted-foreground">Cost: </span>
        <span className="font-mono font-medium">${data.cost.toFixed(2)}</span>
      </p>
      <p className="text-sm">
        <span className="text-muted-foreground">Tokens: </span>
        <span className="font-mono font-medium">
          {(data.tokens / 1000).toFixed(0)}K
        </span>
      </p>
      <p className="text-xs text-muted-foreground">{data.model}</p>
    </div>
  );
};

export const CostChart = ({
  data = [],
  chartType = "line",
}: CostChartProps) => {
  const totalCost = data.reduce((sum, d) => sum + (d.cost ?? 0), 0);
  const totalTokens = data.reduce((sum, d) => sum + (d.tokens ?? 0), 0);

  const ChartComponent = chartType === "bar" ? BarChart : LineChart;

  return (
    <Card className="w-full border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">API Cost Breakdown</CardTitle>
          <Badge className="font-mono text-xs" variant="secondary">
            {chartType}
          </Badge>
        </div>
        <div className="flex gap-4 text-xs">
          <span>
            <span className="text-muted-foreground">Total: </span>
            <span className="font-mono font-medium">
              ${totalCost.toFixed(2)}
            </span>
          </span>
          <span>
            <span className="text-muted-foreground">Tokens: </span>
            <span className="font-mono font-medium">
              {(totalTokens / 1_000_000).toFixed(2)}M
            </span>
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer height="100%" width="100%">
            <ChartComponent data={data}>
              <CartesianGrid
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey="date"
                fontSize={11}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v: string) => v.slice(5)}
                tickLine={false}
              />
              <YAxis
                fontSize={11}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v: number) => `$${v}`}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {chartType === "bar" ? (
                <Bar
                  dataKey="cost"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              ) : (
                <Line
                  dataKey="cost"
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  type="monotone"
                />
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
