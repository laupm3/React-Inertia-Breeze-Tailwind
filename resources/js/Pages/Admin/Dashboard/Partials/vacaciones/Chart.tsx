"use client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/Components/ui/charts";

export function ChartLineDots({ data }: { data?: any }) {
    const chartData =
        data?.map((item: any) => ({
            date: item.date,
            count: item.count,
        })) || [];

    const chartConfig = {
        desktop: {
            label: "Desktop",
        },
        mobile: {
            label: "Mobile",
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
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => format(value, "d MMMM", { locale: es })}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Line
                        dataKey="count"
                        type="bumpX"
                        stroke="var(--custom-orange)"
                        strokeWidth={2}
                        name="Vacaciones"
                        dot={{
                            fill: "var(--custom-orange-half)",
                        }}
                        activeDot={{
                            r: 6,
                        }}
                    />
                </LineChart>
            </ChartContainer>
        </section>
    );
}

