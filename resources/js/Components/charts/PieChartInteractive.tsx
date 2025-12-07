"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector, Cell } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select"
import { useTranslation } from 'react-i18next';

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

export function Component({ data}: { data: Array<{
  title: string,
  Count: number
}> }) {
  // Estado para el item activo
  const [activeItem, setActiveItem] = React.useState<string>(data[0]?.title || '')
  const { t } = useTranslation(['charts']);

  // Índice del item activo
  const activeIndex = React.useMemo(
    () => data.findIndex((item) => item.title === activeItem),
    [activeItem, data]
  )

  // Lista de items para el selector
  const items = React.useMemo(
    () => data.map((item) => item.title),
    [data]
  )

  // Configuración del gráfico
  const chartConfig = {
    Count: {
      label: t('total'),
    },
  } satisfies ChartConfig

  // Calcular total
  const total = data.reduce((sum, item) => sum + item.Count, 0)

  return (
    <div className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <div className="flex w-full justify-end">
          <Select 
            defaultValue={activeItem} 
            onValueChange={setActiveItem}
          >
            <SelectTrigger className="w-[200px] bg-custom-gray-default text-custom-black shadow-md shadow-black/20">
              <SelectValue>{activeItem}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-custom-gray-default text-custom-black shadow-md shadow-black/20">
              {items.map((item, index) => (
                <SelectItem key={item} value={item}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}
                    />
                    <span>{item}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
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
              activeIndex={activeIndex}
              activeShape={({
                cx,
                cy,
                innerRadius,
                outerRadius,
                startAngle,
                endAngle,
                fill,
              }: PieSectorDataItem) => (
                <Sector
                  cx={cx}
                  cy={cy}
                  innerRadius={innerRadius}
                  outerRadius={Number(outerRadius) + 10}
                  startAngle={startAngle}
                  endAngle={endAngle}
                  fill={fill}
                />
              )}
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} 
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
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
                          className="fill-custom-blackLight dark:fill-custom-white text-xl font-bold"
                        >
                          {data[activeIndex]?.Count || 0}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-custom-gray-dark dark:fill-custom-gray-light text-sm"
                        >
                          {t('users')}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
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
