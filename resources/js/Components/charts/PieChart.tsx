"use client"

import { Pie, PieChart, Cell, Text } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/Components/ui/charts"
import { useTranslation } from 'react-i18next';

// Función para obtener el lunes y domingo de la semana actual
const getCurrentWeekDates = () => {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay() + 7);

  return {
    start: monday.toLocaleDateString(),
    end: sunday.toLocaleDateString()
  };
};

const DEFAULT_COLORS = [
  "#8B4513", // Marrón rojizo
  "#D2691E", // Chocolate
  "#CD853F", // Madera clara
  "#DEB887", // Beige madera
  "#F4A460", // Arena
  "#D2B48C", // Bronceado
  "#BC8F8F", // Rosado tierra
  "#A0522D", // Siena
  "#6B4423"  // Marrón oscuro
];

export function Component({ data }: { data: any }) {
  const { t } = useTranslation(['charts']);
  const weekDates = getCurrentWeekDates();

  const chartConfig = {
    [data[0].title]: {
      label: data[0].title,
    },
  } satisfies ChartConfig

  // Calcular el total
  const total = data.reduce((sum: number, entry: any) => sum + entry.Count, 0);

  // Custom label to display in the center of the pie chart
  const renderCustomizedLabel = ({ cx, cy }: { cx: number; cy: number }) => {
    return (
      <g>
        <text 
          x={cx} 
          y={cy} 
          dy={20} 
          textAnchor="middle" 
          fill="currentColor"
          className="font-bold text-3xl"
        >
          {total}
        </text>
        <text 
          x={cx} 
          y={cy} 
          dy={35} 
          textAnchor="middle" 
          fill="currentColor"
          className="text-xs"
        >
          {t('total')}
        </text>
      </g>
    );
  };

  return (
    <div className="flex flex-col">
      <CardHeader className="items-center ">
        <p className="text-sm text-custom-gray-dark dark:text-custom-gray-light">
          {t('weekFrom')} {weekDates.start} {t('to')} {weekDates.end}
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Pie
              data={data}
              dataKey="Count"
              nameKey="title"
              innerRadius={60}
              outerRadius={100}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
            {renderCustomizedLabel({ cx: 125, cy: 115 })}
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium">
          <span className="text-custom-blackLight dark:text-custom-white">
            {t('total')}: <span className="text-[#FF8042]">{total}</span>
          </span>
        </div>
      </CardFooter>
    </div>
  )
}
