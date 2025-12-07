"use client";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/Components/ui/charts";
import { count } from "console";

export function ChartBarDefault({ data }: any) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[150px] text-muted-foreground">
                <p>No hay justificantes recientes.</p>
            </div>
        );
    }

    const chartData = data.map((item: any) => ({
        date: item.date,
        count: item.count,
    }));

    const chartConfig = {
        desktop: {
            label: "count",
            color: "var(--custom-orange)",
        },
    } satisfies ChartConfig;
    return (
        <section>
            <ChartContainer config={chartConfig}>
                <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                        dataKey="count"
                        name="Justificantes"
                        fill="var(--custom-orange)"
                        radius={8}
                    />
                </BarChart>
            </ChartContainer>
        </section>
    );
}
