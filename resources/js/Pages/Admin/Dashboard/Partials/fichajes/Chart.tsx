"use client";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/Components/ui/charts";

// 1. Definimos la estructura de los datos que esperamos
interface ClockingHourData {
    total: number;
    devices: {
        Web?: number;
        Móvil?: number;
        Tablet?: number;
    }
}

interface ClockingData {
    [hour: string]: ClockingHourData;
}

// 2. Usamos el nuevo tipo en las props
export function ChartLineMultiple({ data }: { data?: ClockingData }) {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[150px] text-muted-foreground">
                <p>No hay datos de fichajes.</p>
            </div>
        );
    }
    
    // 3. Ahora TypeScript sabe qué es 'value'
    const chartData = Object.entries(data)
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        .map(([key, value]) => ({
            hour: `${key}:00`,
            mobile: value.devices?.Móvil ?? 0,
            tablet: value.devices?.Tablet ?? 0,
            web: value.devices?.Web ?? 0,
        }));

    const chartConfig = {
        mobile: {
            label: "Mobile",
            color: "var(--chart-2)",
        },
        web: {
            label: "Web",
            color: "var(--custom-orange)",
        },
        tablet: {
            label: "Tablet",
            color: "var(--chart-3)",
        },
    } satisfies ChartConfig;

    return (
        <section>
            <ChartContainer config={chartConfig}>
                <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                        left: 12,
                        right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="hour"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                    />
                    <Line
                        dataKey="mobile"
                        type="monotone"
                        stroke="var(--chart-12)"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Line
                        dataKey="tablet"
                        type="monotone"
                        stroke="var(--chart-20)"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Line
                        dataKey="web"
                        type="monotone"
                        stroke="var(--chart-7)"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ChartContainer>
        </section>
    );
}
