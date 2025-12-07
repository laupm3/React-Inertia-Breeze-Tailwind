"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts"

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

const DEFAULT_COLORS = {
  pending: "#D2691E",
  completed: "#D2B48C"
};

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

export function Component({ data }: { data: any }) {
  const weekDates = getCurrentWeekDates();
  const { t } = useTranslation(['charts']);

  const chartConfig = {
    pending: {
      label: t('pending'),
      color: DEFAULT_COLORS.pending
    },
    completed: {
      label: t('completed'),
      color: DEFAULT_COLORS.completed
    }
  } satisfies ChartConfig;

  // Calcular totales
  const totals = data.reduce((acc: any, day: any) => {
    return {
      pending: acc.pending + day.pending,
      completed: acc.completed + day.completed
    };
  }, { pending: 0, completed: 0 });

  return (
    <div className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <p className="text-sm text-custom-gray-dark dark:text-custom-gray-light">
          {t('weekFrom')} {weekDates.start} {t('to')} {weekDates.end}
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="title" 
              tickLine={false}
              axisLine={false}
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
            <Bar 
              dataKey="pending" 
              name={t('pending')}
              fill={DEFAULT_COLORS.pending} 
              radius={[4, 4, 0, 0]}
              barSize={10}
            />
            <Bar 
              dataKey="completed" 
              name={t('completed')}
              fill={DEFAULT_COLORS.completed} 
              radius={[4, 4, 0, 0]}
              barSize={10}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-center gap-2 text-sm">
        <div className="flex flex-row items-center justify-between gap-4 text-sm">
          <p>
            {t('totalPending')}: 
            <span className="font-bold text-[#D2691E] ml-1">
                {totals.pending}
            </span>
          </p>
          <p>   
            {t('totalCompleted')}: 
            <span className="font-bold text-[#D2B48C] ml-1">
                {totals.completed}
            </span>
          </p>
        </div>
      </CardFooter>
    </div>
  )
}
