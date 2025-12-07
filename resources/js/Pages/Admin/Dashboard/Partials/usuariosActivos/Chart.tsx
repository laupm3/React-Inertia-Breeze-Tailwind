"use client";
import {
    Label,
    PolarGrid,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/Components/ui/charts";

export function ChartRadialShape({
    data,
}: {
    data: { connected_count: number; total_users_count: number };
}) {
    const connected = data?.connected_count ?? 0;
    const total = data?.total_users_count ?? 0;

    const chartData = [
        { name: "active", value: connected, fill: "var(--custom-orange)" },
    ];

    const chartConfig = {
        value: { label: "Usuarios Activos" },
    } satisfies ChartConfig;

    return (
        <section>
            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
            >
                <RadialBarChart
                    data={chartData}
                    startAngle={90}
                    endAngle={-270}
                    innerRadius={80}
                    outerRadius={110}
                    barSize={20}
                >
                    <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-custom-gray-semiLight dark:first:fill-custom-gray-darker last:fill-custom-white dark:last:fill-custom-blackLight"
                        polarRadius={[86, 74]}
                    />
                    <RadialBar
                        dataKey="value"
                        background
                        cornerRadius={10}
                    />
                    <PolarRadiusAxis
                        tick={false}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, total > 0 ? total : 1]}
                    >
                        <Label
                            content={({ viewBox }) => {
                                if (
                                    viewBox &&
                                    "cx" in viewBox &&
                                    "cy" in viewBox
                                ) {
                                    return (
                                        <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                className="fill-foreground text-4xl font-bold"
                                            >
                                                {connected}
                                            </tspan>
                                            <tspan
                                                x={viewBox.cx}
                                                y={(viewBox.cy || 0) + 24}
                                                className="fill-muted-foreground"
                                            >
                                                Conectados
                                            </tspan>
                                        </text>
                                    );
                                }
                            }}
                        />
                    </PolarRadiusAxis>
                </RadialBarChart>
            </ChartContainer>
        </section>
    );
}
