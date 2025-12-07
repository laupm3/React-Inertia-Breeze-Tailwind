"use client"

import { TrendingUp } from "lucide-react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

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

export function Component({ data = [] }: { data?: any[] }) {
  const weekDates = getCurrentWeekDates();
  const { t } = useTranslation(['charts']);
    
  // Transformamos los datos al formato que necesita el gráfico
  const transformedData = [{
    fichados: data.find(item => item.title === 'Fichados')?.value || 0,
    noFichados: data.find(item => item.title === 'No Fichados')?.value || 0,
    completados: data.find(item => item.title === 'Completados')?.value || 0
  }];

  const chartConfig = {
    fichados: {
      label: 'Fichados',
      color: "#22C55E", // verde
    },
    noFichados: {
      label: 'No Fichados',
      color: "#EF4444", // rojo
    },
    completados: {
      label: 'Completados',
      color: "#3B82F6", // azul
    }
  } satisfies ChartConfig;

  const totals = {
    fichados: data.find(item => item.title === 'Fichados')?.value || 0,
    noFichados: data.find(item => item.title === 'No Fichados')?.value || 0,
    completados: data.find(item => item.title === 'Completados')?.value || 0
  };

  const total = totals.fichados + totals.noFichados + totals.completados;

  return (
    <div className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <p className="text-sm text-custom-gray-dark dark:text-custom-gray-light">
            {t('today')}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={transformedData}
            startAngle={180}
            endAngle={0}
            innerRadius={100}
            outerRadius={150}
            cy={180}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text 
                        x={viewBox.cx} 
                        y={(viewBox.cy || 0) - 40} 
                        textAnchor="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 40}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 20}
                          className="fill-muted-foreground"
                        >
                          {t('total')}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="fichados"
              stackId="a"
              cornerRadius={5}
              fill={chartConfig.fichados.color}
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="noFichados"
              stackId="a"
              cornerRadius={5}
              fill={chartConfig.noFichados.color}
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="completados"
              stackId="a"
              cornerRadius={5}
              fill={chartConfig.completados.color}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="grid grid-cols-3 gap-2 w-full">
          <p className="text-xs">   
            <span className="inline-block w-3 h-3 mr-1 rounded-sm" style={{backgroundColor: chartConfig.fichados.color}}></span>
            Fichados: 
            <span className="font-bold ml-1">
                {totals.fichados}
            </span>
          </p>
          <p className="text-xs">
            <span className="inline-block w-3 h-3 mr-1 rounded-sm" style={{backgroundColor: chartConfig.noFichados.color}}></span>
            No Fichados: 
            <span className="font-bold ml-1">
                {totals.noFichados}
            </span>
          </p>
          <p className="text-xs">
            <span className="inline-block w-3 h-3 mr-1 rounded-sm" style={{backgroundColor: chartConfig.completados.color}}></span>
            Completados: 
            <span className="font-bold ml-1">
                {totals.completados}
            </span>
          </p>
        </div>
      </CardFooter>
    </div>
  )
}
