"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { useTranslation } from 'react-i18next';

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


export function Component({ data }: { data: any }) {
  const { t } = useTranslation(['charts']);
  const actualDay = new Date();

  const chartConfig = {
    [data[0].title]: {
      label: data[0].title,
    },
  } satisfies ChartConfig

  //calcular total
  const total = data.reduce((sum: number, entry: any) => sum + entry.Count, 0);

  return (
    <div>
      <CardHeader>
        <p className="text-sm text-custom-gray-dark dark:text-custom-gray-light">
          {actualDay.getDate()}/{actualDay.getMonth() + 1}/{actualDay.getFullYear()}
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="title"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="Count" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="Count"
              layout="vertical"
              fill="#FF8042"
              radius={4}
            >
              <LabelList
                dataKey="title"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList
                dataKey="Count"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium">
          <span className="text-custom-blackLight dark:text-custom-white">
            {t('total')}: <span className="text-[#FF8042]">{total}</span>
          </span>
        </div>
      </CardFooter>
    </div>
  )
}
