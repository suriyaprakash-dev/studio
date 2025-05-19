
'use client';

import * as React from 'react';
import type { ElasticityResultData, ElasticityInput as ElasticityInputType } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Minus, BarChartBig, LoaderCircle, AlertCircle, Scale, DollarSign, LineChart as LineChartIcon } from 'lucide-react'; // Changed BarChart2 to LineChartIcon
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'; // Changed BarChart imports to LineChart
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig, // Import ChartConfig type
} from "@/components/ui/chart";

interface ElasticityResultProps {
  result: ElasticityResultData | null;
  isLoading: boolean;
  inputData: ElasticityInputType | null;
}

function getBadgeVariant(classification: ElasticityResultData['classification']): 'default' | 'secondary' | 'destructive' | 'outline' | 'accent' {
    switch (classification) {
        case 'Elastic':
        case 'Perfectly Elastic':
            return 'accent';
        case 'Inelastic':
        case 'Perfectly Inelastic':
            return 'secondary';
        case 'Unit Elastic':
            return 'default';
        case 'Invalid Input':
            return 'destructive';
        default:
            return 'secondary';
    }
}

function getIcon(classification: ElasticityResultData['classification']): React.ReactNode {
    switch (classification) {
        case 'Elastic':
        case 'Perfectly Elastic':
            return <TrendingUp className="h-5 w-5" />;
        case 'Inelastic':
        case 'Perfectly Inelastic':
            return <TrendingDown className="h-5 w-5" />;
        case 'Unit Elastic':
            return <Minus className="h-5 w-5" />;
        case 'Invalid Input':
             return <AlertCircle className="h-5 w-5" />;
        default:
            return null;
    }
}

function getDescription(classification: ElasticityResultData['classification']): string {
    switch (classification) {
        case 'Elastic':
            return 'Demand shows significant sensitivity to price changes. Consider strategic price decreases to potentially boost revenue.';
        case 'Inelastic':
            return 'Demand demonstrates low sensitivity to price changes. Price increases might enhance total revenue with minimal impact on quantity sold.';
        case 'Unit Elastic':
            return 'Quantity demanded changes proportionally to price changes. Revenue is likely optimized at the current pricing.';
         case 'Perfectly Inelastic':
            return 'Quantity demanded remains constant irrespective of price adjustments (theoretical, e.g., life-saving medication).';
        case 'Perfectly Elastic':
            return 'Consumers demand unlimited quantity at a specific price, but none above it (theoretical market condition).';
        case 'Invalid Input':
            return 'Calculation requires valid inputs. Ensure prices/quantities are positive and represent a change.';
        default:
            return 'Input at least two data points to view the elasticity analysis.';
    }
}

// Configuration for the Line Chart
const lineChartConfig = {
  price: {
    label: "% Change Price",
    color: "hsl(var(--chart-1))",
    icon: DollarSign,
  },
  quantity: {
    label: "% Change Quantity",
    color: "hsl(var(--chart-2))",
    icon: Scale,
  },
} satisfies ChartConfig;


export function ElasticityResult({ result, isLoading, inputData }: ElasticityResultProps) {

  const showChart = result && !result.error && result.percentageChangeP !== undefined && result.percentageChangeQ !== undefined;

  // Data for the Line Chart
  // It's an array with one object, where keys 'price' and 'quantity' will be used for dataKeys of Lines
  const chartDataForLine = showChart
    ? [{
        name: 'Comparison', // This name is for the XAxis category
        price: result.percentageChangeP! * 100, // Values are percentages
        quantity: result.percentageChangeQ! * 100,
      }]
    : [];

  let priceIncreased: boolean | undefined;
  let quantityIncreased: boolean | undefined;

  if (inputData && inputData.points && inputData.points.length >= 2) {
    const firstPoint = inputData.points[0];
    const secondPoint = inputData.points[1];
    if (firstPoint && secondPoint && typeof firstPoint.price === 'number' && typeof secondPoint.price === 'number') {
        priceIncreased = secondPoint.price > firstPoint.price;
    }
    if (firstPoint && secondPoint && typeof firstPoint.quantity === 'number' && typeof secondPoint.quantity === 'number') {
        quantityIncreased = secondPoint.quantity > firstPoint.quantity;
    }
  }


  return (
    <Card className="w-full shadow-lg-custom rounded-xl border-border/60 bg-card h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
          <BarChartBig size={24}/>
          Analysis Results
        </CardTitle>
        <CardDescription>Price Elasticity of Demand (PED) - using first two data points</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-start items-center text-center p-6 space-y-6">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground flex-grow">
             <LoaderCircle className="animate-spin h-12 w-12" />
             <span className="text-lg mt-2">Calculating...</span>
           </div>
        ) : result ? (
          <>
            <div className="flex flex-col items-center space-y-3 w-full">
                {result.error ? (
                   <>
                    <Badge variant={getBadgeVariant(result.classification)} className="text-base px-4 py-1 flex items-center gap-2 shadow-sm">
                        {getIcon(result.classification)}
                        {result.classification}
                    </Badge>
                     <p className="text-sm text-destructive mt-2">{result.error}</p>
                   </>
                ) : (
                 <>
                    <span className="text-5xl font-bold tracking-tight text-primary">
                        {isFinite(result.elasticity) ? result.elasticity.toFixed(3) : (result.elasticity === Infinity ? '∞' : (result.elasticity === -Infinity ? '-∞' : 'N/A'))}
                    </span>
                     <Badge variant={getBadgeVariant(result.classification)} className="text-base px-4 py-1 flex items-center gap-2 shadow-sm">
                        {getIcon(result.classification)}
                        {result.classification}
                    </Badge>
                 </>
                )}
                 <p className="text-sm text-muted-foreground pt-2 max-w-xs">{getDescription(result.classification)}</p>
            </div>

            {showChart && chartDataForLine.length > 0 && (
              <>
                <Separator className="my-4 w-3/4 mx-auto" />
                <div className="w-full space-y-3">
                    <h3 className="text-lg font-medium text-foreground flex items-center justify-center gap-2">
                        <LineChartIcon size={20} /> Relative Change Magnitude
                    </h3>
                    <ChartContainer config={lineChartConfig} className="mx-auto aspect-[16/10] h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartDataForLine} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid vertical={false} strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tick={false} 
                            label={{ value: "Comparison Metric", position: 'insideBottom', dy: 10, fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis
                            tickFormatter={(value) => `${value.toFixed(0)}%`}
                            domain={[0, 'dataMax + 10']} 
                            allowDataOverflow={true}
                            width={50}
                           />
                          <ChartTooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={<ChartTooltipContent indicator="dot" />}
                          />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="var(--color-price)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "var(--color-price)" }}
                            activeDot={{ r: 6 }}
                            name="price" // Name used by legend and tooltip
                          />
                          <Line
                            type="monotone"
                            dataKey="quantity"
                            stroke="var(--color-quantity)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "var(--color-quantity)" }}
                            activeDot={{ r: 6 }}
                            name="quantity" // Name used by legend and tooltip
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                    <p className="text-xs text-muted-foreground italic text-center max-w-md mx-auto">
                        Shows the absolute percentage change in price vs. quantity (using the first two data points).
                        {priceIncreased !== undefined && quantityIncreased !== undefined && ` Price ${priceIncreased ? 'increased' : 'decreased'}, Quantity ${quantityIncreased ? 'increased' : 'decreased'}.`}
                    </p>
                </div>
              </>
            )}
          </>
        ) : (
          <p className="text-lg text-muted-foreground flex-grow flex items-center justify-center">Enter at least two data points to calculate elasticity.</p>
        )}
      </CardContent>
    </Card>
  );
}

