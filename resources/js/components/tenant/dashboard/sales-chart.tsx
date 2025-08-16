import { Card } from '@/components/ui/card';
import { Chart } from '@/components/ui/charts';

interface SalesChartProps {
    data: Array<{
        name: string;
        value: number;
    }>;
}

export function SalesChart({ data }: SalesChartProps) {
    return (
        <Card className="p-6">
            <div className="flex flex-col gap-4">
                <div>
                    <h3 className="text-lg font-semibold">Ventas por mes</h3>
                    <p className="text-sm text-muted-foreground">
                        Últimos 6 meses
                    </p>
                </div>
                <div className="h-[300px]">
                    <Chart
                        type="bar"
                        data={data}
                    />
                </div>
            </div>
        </Card>
    );
} 