import React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';

interface ChartProps {
    type: 'bar' | 'pie';
    data: Array<{
        name: string;
        value: number;
    }>;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Chart({ type, data }: ChartProps) {
    const formattedData = data.map(item => ({
        name: item.name,
        value: item.value
    }));

    if (type === 'pie') {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={formattedData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#4f46e5"
                        label={(entry) => entry.name}
                    >
                        {formattedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value: number) => 
                            new Intl.NumberFormat('es-PE', {
                                style: 'currency',
                                currency: 'PEN'
                            }).format(value)
                        }
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                    formatter={(value: number) => 
                        new Intl.NumberFormat('es-PE', {
                            style: 'currency',
                            currency: 'PEN'
                        }).format(value)
                    }
                />
                <Legend />
                <Bar dataKey="value" name="Ventas" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

import { ReactNode } from "react";
import { Tooltip as RechartsTooltip, TooltipProps } from "recharts";

interface ChartContainerProps {
  children: ReactNode;
  className?: string;
}

export function ChartContainer({ children, className = "" }: ChartContainerProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      {children}
    </div>
  );
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function ChartTooltipContent({ active, payload, label }: ChartTooltipContentProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-lg border border-sidebar-border/70 dark:border-sidebar-border">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className="text-sm">
            <span className="font-medium">{entry.name}</span>: {entry.value}
          </p>
        ))}
      </div>
    );
  }

  return null;
}

export const ChartTooltip = RechartsTooltip; 