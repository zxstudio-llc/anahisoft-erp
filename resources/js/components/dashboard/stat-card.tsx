import { ReactNode } from "react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  footer?: {
    text: string;
    icon?: ReactNode;
  };
}

export function StatCard({ title, value, description, icon, trend, footer }: StatCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {value}
          </CardTitle>
        </div>
        {icon && (
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            {icon}
          </div>
        )}
        {trend && (
          <div className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${
            trend.positive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.positive ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
              </svg>
            )}
            {trend.value}
          </div>
        )}
      </CardHeader>
      {(description || footer) && (
        <CardFooter className="flex-col items-start gap-1.5 pt-2 text-sm">
          {description && <div className="text-muted-foreground">{description}</div>}
          {footer && (
            <div className="line-clamp-1 flex gap-2 font-medium">
              {footer.text}
              {footer.icon}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
} 