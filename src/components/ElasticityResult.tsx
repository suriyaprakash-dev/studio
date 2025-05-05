
'use client';

import * as React from 'react';
import type { ElasticityResultData, ElasticityInput } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChartBig, LoaderCircle, AlertCircle, PieChart as PieChartIcon, Scale } from 'lucide-react'; // Added Scale for Quantity
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"; // Import ShadCN chart components

interface ElasticityResultProps {
  result: ElasticityResultData | null;
  isLoading: boolean;
  inputData: ElasticityInput | null; // Add inputData prop
}

function getBadgeVariant(classification: ElasticityResultData['classification']): 'default' | 'secondary' | 'destructive' | 'outline' | 'accent' { // Added accent variant
    switch (classification) {
        case 'Elastic':
        case 'Perfectly Elastic':
            return 'accent'; // Use accent (Green) for elastic
        case 'Inelastic':
        case 'Perfectly Inelastic':
            return 'secondary'; // Gray badge for inelastic
        case 'Unit Elastic':
            return 'default'; // Use primary (Blue) for unit elastic
        case 'Invalid Input':
            return 'destructive'; // Red badge for invalid input
        default:
            return 'secondary';
    }
}

function getIcon(classification: ElasticityResultData['classification']): React.ReactNode {
    switch (classification) {
        case 'Elastic':
        case 'Perfectly Elastic':
            return <TrendingUp className="h-5 w-5" />; // Removed themed color, rely on badge variant
        case 'Inelastic':
        case 'Perfectly Inelastic':
            return <TrendingDown className="h-5 w-5" />; // Removed themed color
        case 'Unit Elastic':
            return <Minus className="h-5 w-5" />; // Removed themed color
        case 'Invalid Input':
             return <AlertCircle className="h-5 w-5" />; // Removed themed color
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
            return 'Input price and quantity data to view the elasticity analysis.';
    }
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))']; // Use theme colors

// Define chart configuration for ShadCN Chart components
const chartConfig = {
  percentageChangeP: {
    label: "% Change Price",
    color: "hsl(var(--chart-1))", // Use theme variable
    icon: DollarSign,
  },
  percentageChangeQ: {
    label: "% Change Quantity",
    color: "hsl(var(--chart-2))", // Use theme variable
    icon: Scale, // Use Scale icon for quantity
  },
} satisfies React.ComponentProps<typeof ChartContainer>["config"];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const percentage = (percent * 100).toFixed(1);

  // Only render label if percentage is significant enough
  if (percent < 0.05) return null;

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
        { name: '% Change Price', value: result.percentageChangeP!, fill: chartConfig.percentageChangeP.color }, // Use defined colors
        { name: '% Change Quantity', value: result.percentageChangeQ!, fill: chartConfig.percentageChangeQ.color },
      ]
    : [];

  // Calculate change direction for context
  const priceIncreased = inputData && inputData.finalPrice > inputData.initialPrice;
  const quantityIncreased = inputData && inputData.finalQuantity > inputData.initialQuantity;


  return (
    <Card className="w-full shadow-lg-custom rounded-xl border-border/60 bg-card h-full flex flex-col"> {/* Use large custom shadow */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
          <BarChartBig size={24}/>
          Analysis Results
        </CardTitle>
        <CardDescription>Price Elasticity of Demand (PED)</CardDescription>
      </CardHeader>
      {/* Adjusted padding and alignment for better centering and vertical space */}
      <CardContent className="flex-grow flex flex-col justify-start items-center text-center p-6 space-y-6"> {/* Use p-6, space-y-6 */}
        {isLoading ? (
           <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground flex-grow"> {/* Make loader centered */}
             <LoaderCircle className="animate-spin h-12 w-12" /> {/* Increased size */}
             <span className="text-lg mt-2">Calculating...</span>
           </div>
        ) : result ? (
          <>
            {/* Display PED value and classification first */}
             <div className="flex flex-col items-center space-y-3 w-full"> {/* Reduced space */}
                {result.error ? (
                   <>
                    <Badge variant={getBadgeVariant(result.classification)} className="text-base px-4 py-1 flex items-center gap-2 shadow-sm"> {/* Adjusted padding/size */}
                        {getIcon(result.classification)}
                        {result.classification}
                    </Badge>
                     <p className="text-sm text-destructive mt-2">{result.error}</p>
                   </>
                ) : (
                 <>
                    <span className="text-5xl font-bold tracking-tight text-primary"> {/* Adjusted size */}
                        {isFinite(result.elasticity) ? result.elasticity.toFixed(3) : (result.elasticity === Infinity ? '∞' : (result.elasticity === -Infinity ? '-∞' : 'N/A'))}
                    </span>
                     <Badge variant={getBadgeVariant(result.classification)} className="text-base px-4 py-1 flex items-center gap-2 shadow-sm"> {/* Adjusted padding/size */}
                        {getIcon(result.classification)}
                        {result.classification}
                    </Badge>
                 </>
                )}
                 <p className="text-sm text-muted-foreground pt-2 max-w-xs">{getDescription(result.classification)}</p> {/* Adjusted top padding */}
             </div>

            {/* Separator and Pie Chart Section */}
             {showChart && (
              <div className="w-full pt-4 space-y-4">
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
                                innerRadius={50} // Create a donut chart
                                fill="hsl(var(--primary))" // Default fill (overridden by cell)
                                labelLine={false}
                                label={renderCustomizedLabel}
                                strokeWidth={2}
                                stroke="hsl(var(--background))" // Add border between segments
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                        </PieChart>
                    </ResponsiveContainer>
                 </ChartContainer>
                 <p className="text-xs text-muted-foreground italic text-center max-w-xs mx-auto">
                    Shows the absolute percentage change in price vs. quantity.
                    {inputData && ` Price ${priceIncreased ? 'increased' : 'decreased'}, Quantity ${quantityIncreased ? 'increased' : 'decreased'}.`}
                 </p>
               </div>
            )}
          </>
        ) : (
          <p className="text-lg text-muted-foreground flex-grow flex items-center justify-center">Enter data points to calculate elasticity.</p> // Center placeholder
        )}
      </CardContent>
    </Card>
  );
}
