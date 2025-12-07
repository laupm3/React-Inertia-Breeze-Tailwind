"use client"

import { Activity } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

import {
  CardContent,
  CardFooter,
  CardHeader,
} from "@/Components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/Components/ui/charts"
import { useTranslation } from 'react-i18next';

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

export function Component({ data }: { data: any }) {
  const weekDates = getCurrentWeekDates();
  const { t } = useTranslation(['charts']);

  // Calcular el total
  const total = data?.reduce((sum: number, entry: any) => sum + entry.count, 0) || 0;

  const chartConfig = {
    count: {
      label: t('activeUsers'),
      color: "#FF8042",
      icon: Activity,
    },
  } satisfies ChartConfig

  return (
    <div className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <p className="text-sm text-custom-gray-dark dark:text-custom-gray-light">
          {t('weekFrom')} {weekDates.start} {t('to')} {weekDates.end}
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="title"
              tickLine={false}
              axisLine={false}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Area
              type="step"
              dataKey="count"
              stroke="#FF8042"
              fill="#FF8042"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-center gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium">
          <span className="text-custom-blackLight dark:text-custom-white">
            {t('total')}: <span className="text-[#FF8042]">{total}</span>
          </span>
        </div>
      </CardFooter>
    </div>
  )
}
