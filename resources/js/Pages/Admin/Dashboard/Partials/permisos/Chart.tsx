"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/Components/ui/charts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

export function ChartPieInteractive({
    data,
    text,
}: {
    data: any;
    text: string;
}) {
    const desktopData =
        data?.map((item: any, index: number) => ({
            month: item.name
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/\s/g, "_"),
            desktop: item.count,
            fill: `var(--chart-${index + 1})`,
        })) || [];

    if (!desktopData || desktopData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[300px] text-muted-foreground">
                <p>No hay datos disponibles</p>
            </div>
        );
    }

    const chartConfig: ChartConfig = Object.fromEntries(
        data.map((item: any, index: number) => [
            item.name
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/\s/g, "_"),
            { label: item.name, color: `var(--chart-${index + 1})` },
        ])
    );

    const id = "pie-interactive";
    const [activeMonth, setActiveMonth] = React.useState(desktopData[0].month);

    const activeIndex = React.useMemo(
        () => desktopData.findIndex((item: any) => item.month === activeMonth),
        [activeMonth]
    );
    const months = React.useMemo(
        () => desktopData.map((item: any) => item.month),
        []
    );

    return (
        <section>
            <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">{text}</span>
                <Select value={activeMonth} onValueChange={setActiveMonth}>
                    <SelectTrigger
                        className="ml-auto h-7 w-[130px] rounded-lg pl-2.5 bg-custom-gray-default dark:bg-custom-gray-darker text-nowrap"
                        aria-label="Select a value"
                    >
                        <SelectValue placeholder="selecciona..." />
                    </SelectTrigger>
                    <SelectContent
                        align="end"
                        className="rounded-xl bg-custom-gray-default dark:bg-custom-gray-darker"
                    >
                        {months.map((key: any, index: number) => {
                            const config =
                                chartConfig[key as keyof typeof chartConfig];

                            if (!config) {
                                return null;
                            }

                            return (
                                <SelectItem
                                    key={key}
                                    value={key}
                                    className="rounded-lg [&_span]:flex"
                                >
                                    <div className="flex items-center gap-2 text-xs">
                                        <span
                                            className="flex h-3 w-3 shrink-0 rounded-xs"
                                            style={{
                                                backgroundColor: `var(--chart-${
                                                    index + 1
                                                })`,
                                            }}
                                        />
                                        {config?.label}
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>
            <ChartContainer
                id={id}
                config={chartConfig}
                className="mx-auto aspect-square w-full max-w-[300px]"
            >
                <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={desktopData}
                        dataKey="desktop"
                        nameKey="month"
                        innerRadius={60}
                        strokeWidth={5}
                        activeIndex={activeIndex}
                        activeShape={({
                            outerRadius = 0,
                            ...props
                        }: PieSectorDataItem) => (
                            <g>
                                <Sector
                                    {...props}
                                    outerRadius={outerRadius + 10}
                                />
                                <Sector
                                    {...props}
                                    outerRadius={outerRadius + 25}
                                    innerRadius={outerRadius + 12}
                                />
                            </g>
                        )}
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
                                                className="fill-foreground text-3xl font-bold"
                                            >
                                                {desktopData[
                                                    activeIndex
                                                ].desktop.toLocaleString()}
                                            </tspan>
                                            <tspan
                                                x={viewBox.cx}
                                                y={(viewBox.cy || 0) + 24}
                                                className="fill-muted-foreground"
                                            >
                                                Permisos
                                            </tspan>
                                        </text>
                                    );
                                }
                            }}
                        />
                    </Pie>
                </PieChart>
            </ChartContainer>
        </section>
    );
}
