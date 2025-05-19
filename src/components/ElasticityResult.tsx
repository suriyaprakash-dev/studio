
'use client';

import * as React from 'react';
import type { ElasticityResultData, ElasticityInput as ElasticityInputType } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Minus, BarChartBig, LoaderCircle, AlertCircle, LineChart as LineChartIcon, ShoppingCart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts';
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { DollarSign } from 'lucide-react'; // Ensure DollarSign is imported if used here or in ChartConfig

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
            return 'Calculation requires valid inputs. Ensure prices/quantities are positive and represent a change between the first and last points.';
        default:
            return 'Input at least two data points to view the elasticity analysis.';
    }
}

const trendChartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--chart-1))",
    icon: DollarSign,
  },
  quantity: {
    label: "Quantity",
    color: "hsl(var(--chart-2))",
    icon: ShoppingCart,
  },
} satisfies ChartConfig;

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ElasticityResult({ result, isLoading, inputData }: ElasticityResultProps) {

  const trendChartData = React.useMemo(() => {
    if (inputData && inputData.points && inputData.points.length > 0) {
      return inputData.points.map((point, index) => ({
        name: inputData.points.length <= 12 && index < monthNames.length 
              ? monthNames[index] 
              : `Point ${index + 1}`,
        price: point.price,
        quantity: point.quantity,
      }));
    }
    return [];
  }, [inputData]);

  const showTrendChart = trendChartData.length >= 1; // Show trend if at least 1 point

  let pedDescriptionText = "Price Elasticity of Demand (PED)";
  if (result && !result.error && inputData && inputData.points) {
    if (inputData.points.length > 2) {
      pedDescriptionText += " - using the first and last data points provided";
    } else if (inputData.points.length === 2) {
      pedDescriptionText += " - using the two data points provided";
    }
  }


  return (
    <Card className="w-full shadow-lg-custom rounded-xl border-border/60 bg-card h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
          <BarChartBig size={24}/>
          Analysis Results
        </CardTitle>
        <CardDescription>{pedDescriptionText}</CardDescription>
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

            {showTrendChart && (
              <>
                <Separator className="my-4 w-3/4 mx-auto" />
                <div className="w-full space-y-3">
                    <h3 className="text-lg font-medium text-foreground flex items-center justify-center gap-2">
                        <LineChartIcon size={20} /> Price & Quantity Trend
                    </h3>
                    <ChartContainer config={trendChartConfig} className="mx-auto aspect-[16/9] h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            dataKey="name"
                            tickLine={true}
                            axisLine={true}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis
                            yAxisId="left"
                            stroke="var(--color-price)"
                            tickFormatter={(value) => typeof value === 'number' ? `$${value.toFixed(2)}` : value}
                            tick={{ fontSize: 10 }}
                            domain={['auto', 'auto']}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="var(--color-quantity)"
                            tickFormatter={(value) => typeof value === 'number' ? `${value.toFixed(0)}` : value}
                            tick={{ fontSize: 10 }}
                            domain={['auto', 'auto']}
                          />
                          <ChartTooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={
                                <ChartTooltipContent
                                    indicator="dot"
                                    formatter={(value, name, props) => {
                                        if (name === 'price' && typeof value === 'number') {
                                            return `$${value.toFixed(2)}`;
                                        }
                                        if (name === 'quantity' && typeof value === 'number') {
                                            return `${value.toFixed(0)} units`;
                                        }
                                        return value;
                                    }}
                                />
                            }
                          />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="price"
                            stroke="var(--color-price)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "var(--color-price)" }}
                            activeDot={{ r: 6 }}
                            name="Price"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="quantity"
                            stroke="var(--color-quantity)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "var(--color-quantity)" }}
                            activeDot={{ r: 6 }}
                            name="Quantity"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                    <p className="text-xs text-muted-foreground italic text-center max-w-md mx-auto">
                        Line graph showing the trend of price and quantity across all entered data points.
                        {inputData && inputData.points.length <=12 && inputData.points.length > 0 && " (Interpreted as monthly data)"}
                    </p>
                </div>
              </>
            )}
          </>
        ) : (
          <p className="text-lg text-muted-foreground flex-grow flex items-center justify-center">Enter at least two data points to calculate elasticity and view trends.</p>
        )}
      </CardContent>
    </Card>
  );
}
