"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { useTranslation } from 'react-i18next';

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

export function Component({ data }: { data: any }) {
  const { t } = useTranslation(['charts']);
  const chartConfig = {
    desktop: {
      label: t('desktop'),
      color: "#D2691E",
    },
    mobile: {
      label: t('mobile'),
      color: "#D2B48C",
    },
  } satisfies ChartConfig

  return (
    <div>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="title"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="desktop"
              type="monotone"
              stroke="#D2691E"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="tablet"
              type="monotone"
              stroke="#6B4423"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="mobile"
              type="monotone"
              stroke="#D2B48C"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-center gap-2 text-sm">
        <div className="flex flex-row gap-4 text-sm"> 
            <p>
                {t('total')}: 
                <span className="font-bold text-[#D2691E] ml-1">
                    {data.reduce((sum: number, entry: any) => sum + entry.desktop + entry.mobile + entry.tablet, 0)}
                </span>
            </p>
        </div>
      </CardFooter>
    </div>
  )
}
