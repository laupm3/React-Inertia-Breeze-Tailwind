"use client";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/Components/ui/charts";

export function ChartBarMixed({ data }: { data?: any }) {
    const chartData =
        Object.entries(data).map(([Key, value]: any) => ({
            count: `Count${Key}`,
            contratos: value,
        })) || [];

    const chartConfig = {
        contratos: {
            label: "Contratos",
        },
        Count10: {
            label: "10 dias",
            color: "var(--chart-1)",
        },
        Count15: {
            label: "15 dias",
            color: "var(--chart-2)",
        },
        Count30: {
            label: "30 dias",
            color: "var(--chart-3)",
        },
    } satisfies ChartConfig;

    return (
        <section>
            <ChartContainer config={chartConfig}>
                <BarChart
                    accessibilityLayer
                    data={chartData}
                    layout="vertical"
                    margin={{
                        left: 0,
                    }}
                >
                    <YAxis
                        dataKey="count"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) =>
                            chartConfig[value as keyof typeof chartConfig]
                                ?.label
                        }
                    />
                    <XAxis dataKey="contratos" type="number" hide />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                        dataKey="contratos"
                        layout="vertical"
                        radius={5}
                        barSize={40}
                        fill="var(--custom-orange)"
                    />
                </BarChart>
            </ChartContainer>
        </section>
    );
}
