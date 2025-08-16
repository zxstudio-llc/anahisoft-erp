import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/charts";

interface TenantsChartProps {
  data: Array<{ name: string; value: number }>;
}

export function TenantsChart({ data }: TenantsChartProps) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">Inquilinos por Mes</h3>
      <div className="h-64">
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
} 