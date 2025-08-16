import { Card } from '@/components/ui/card';
import { Chart } from '@/components/ui/charts';

interface InvoicesChartProps {
    data: Array<{
        name: string;
        value: number;
    }>;
}

export function InvoicesChart({ data }: InvoicesChartProps) {
    return (
        <Card className="p-6">
            <div className="flex flex-col gap-4">
                <div>
                    <h3 className="text-lg font-semibold">Facturas por estado</h3>
                    <p className="text-sm text-muted-foreground">
                        Distribución actual
                    </p>
                </div>
                <div className="h-[300px]">
                    <Chart
                        type="pie"
                        data={data}
                    />
                </div>
            </div>
        </Card>
    );
} 