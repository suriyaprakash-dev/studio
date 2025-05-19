
'use client';

import * as React from 'react';
import type { ElasticityResultData, ElasticityInput as ElasticityInputType } from '@/app/actions'; // Renamed to avoid conflict
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator'; // Added Separator import
import { TrendingUp, TrendingDown, Minus, BarChartBig, LoaderCircle, AlertCircle, PieChart as PieChartIcon, Scale, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'; // Removed unused Legend, Tooltip (using ChartTooltip)
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface ElasticityResultProps {
  result: ElasticityResultData | null;
  isLoading: boolean;
  inputData: ElasticityInputType | null; // Updated to use the new ElasticityInputType which contains points array
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

const chartConfig = {
  percentageChangeP: {
    label: "% Change Price",
    color: "hsl(var(--chart-1))",
    icon: DollarSign,
  },
  percentageChangeQ: {
    label: "% Change Quantity",
    color: "hsl(var(--chart-2))",
    icon: Scale,
  },
} satisfies React.ComponentProps<typeof ChartContainer>["config"];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const percentage = (percent * 100).toFixed(1);

  if (percent < 0.05) return null; // Don't render label if too small

  return (
    <text x={x} y={y} fill="hsl(var(--primary-foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight={500}>
      {`${percentage}%`}
    </text>
  );
};


export function ElasticityResult({ result, isLoading, inputData }: ElasticityResultProps) {

  const showChart = result && !result.error && result.percentageChangeP !== undefined && result.percentageChangeQ !== undefined && isFinite(result.percentageChangeP) && isFinite(result.percentageChangeQ) && (result.percentageChangeP > 0 || result.percentageChangeQ > 0);

  const pieData = showChart
    ? [
        { name: chartConfig.percentageChangeP.label, value: result.percentageChangeP!, fill: chartConfig.percentageChangeP.color },
        { name: chartConfig.percentageChangeQ.label, value: result.percentageChangeQ!, fill: chartConfig.percentageChangeQ.color },
      ].filter(item => item.value > 0) // Filter out zero values for pie chart
    : [];

  // Determine price and quantity change direction using the first two points if inputData is available
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
            {/* Section for PED value, classification, and description */}
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

            {/* Section for the Chart, shown if showChart is true and pieData has entries */}
            {showChart && pieData.length > 0 && (
              <>
                <Separator className="my-4 w-3/4 mx-auto" />
                <div className="w-full space-y-4">
                    <h3 className="text-lg font-medium text-foreground flex items-center justify-center gap-2">
                        <PieChartIcon size={20} /> Relative Change Magnitude
                    </h3>
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={50}
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    strokeWidth={2}
                                    stroke="hsl(var(--background))"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                            </PieChart>
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

