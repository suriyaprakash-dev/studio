import type { ElasticityResultData } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChartBig, LoaderCircle, AlertCircle } from 'lucide-react'; // Replaced SVGs

interface ElasticityResultProps {
  result: ElasticityResultData | null;
  isLoading: boolean;
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
            return <TrendingUp className="h-5 w-5 text-accent-foreground" />; // Use themed color
        case 'Inelastic':
        case 'Perfectly Inelastic':
            return <TrendingDown className="h-5 w-5 text-secondary-foreground" />; // Use themed color
        case 'Unit Elastic':
            return <Minus className="h-5 w-5 text-primary-foreground" />; // Use themed color
        case 'Invalid Input':
             return <AlertCircle className="h-5 w-5 text-destructive-foreground" />; // Use themed color
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
            return 'Calculation requires valid inputs. Please ensure prices and quantities are positive numbers and represent a change.';
        default:
            return 'Input price and quantity data to view the elasticity analysis.';
    }
}


export function ElasticityResult({ result, isLoading }: ElasticityResultProps) {
  return (
    <Card className="w-full shadow-lg rounded-xl border-border/60 card-hover-effect h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
          <BarChartBig size={24}/>
          Analysis Results
        </CardTitle>
        <CardDescription>Price Elasticity of Demand (PED)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 flex-grow flex flex-col justify-center items-center text-center p-6">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center space-y-3 p-8 text-muted-foreground">
             <LoaderCircle className="animate-spin h-10 w-10" />
             <span className="text-lg">Calculating Elasticity...</span>
           </div>
        ) : result ? (
          <>
            {result.error ? (
               <div className="flex flex-col items-center space-y-3">
                 <Badge variant={getBadgeVariant(result.classification)} className="text-xl px-4 py-1.5 flex items-center gap-2">
                    {getIcon(result.classification)}
                    {result.classification}
                 </Badge>
                 <p className="text-base text-destructive mt-2">{result.error}</p>
                 <p className="text-base text-muted-foreground pt-2">{getDescription(result.classification)}</p>
               </div>

            ) : (
             <div className="flex flex-col items-center space-y-3">
                 <span className="text-5xl font-bold tracking-tight text-primary">
                    {isFinite(result.elasticity) ? result.elasticity.toFixed(3) : (result.elasticity === Infinity ? '∞' : (result.elasticity === -Infinity ? '-∞' : 'N/A'))}
                 </span>
                 <Badge variant={getBadgeVariant(result.classification)} className="text-xl px-4 py-1.5 flex items-center gap-2 shadow-sm">
                    {getIcon(result.classification)}
                    {result.classification}
                 </Badge>
                 <p className="text-base text-muted-foreground pt-3 max-w-sm">{getDescription(result.classification)}</p>
             </div>
            )}
          </>
        ) : (
          <p className="text-lg text-muted-foreground p-8">Enter data points to calculate elasticity.</p>
        )}
      </CardContent>
    </Card>
  );
}
