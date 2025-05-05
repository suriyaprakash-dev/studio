
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


export function ElasticityResult({ result, isLoading }: ElasticityResultProps) {
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
      <CardContent className="flex-grow flex flex-col justify-center items-center text-center p-8 min-h-[220px]"> {/* Increased padding and min-height */}
        {isLoading ? (
           <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground"> {/* Increased space */}
             <LoaderCircle className="animate-spin h-12 w-12" /> {/* Increased size */}
             <span className="text-lg mt-2">Calculating...</span>
           </div>
        ) : result ? (
          <>
            {result.error ? (
               <div className="flex flex-col items-center space-y-4"> {/* Increased space */}
                  {/* Ensure badge takes full width if needed or centered */}
                 <Badge variant={getBadgeVariant(result.classification)} className="text-lg px-5 py-1.5 flex items-center gap-2 shadow-md"> {/* Larger padding, shadow */}
                    {getIcon(result.classification)}
                    {result.classification}
                 </Badge>
                 <p className="text-base text-destructive mt-3">{result.error}</p>
                 <p className="text-sm text-muted-foreground pt-2 max-w-xs">{getDescription(result.classification)}</p>
               </div>

            ) : (
             <div className="flex flex-col items-center space-y-4"> {/* Increased space */}
                 <span className="text-6xl font-bold tracking-tight text-primary mb-2"> {/* Larger text, adjusted margin */}
                    {isFinite(result.elasticity) ? result.elasticity.toFixed(3) : (result.elasticity === Infinity ? '∞' : (result.elasticity === -Infinity ? '-∞' : 'N/A'))}
                 </span>
                 <Badge variant={getBadgeVariant(result.classification)} className="text-lg px-5 py-1.5 flex items-center gap-2 shadow-md"> {/* Larger padding, shadow */}
                    {getIcon(result.classification)}
                    {result.classification}
                 </Badge>
                 <p className="text-sm text-muted-foreground pt-4 max-w-xs">{getDescription(result.classification)}</p> {/* Adjusted top padding */}
             </div>
            )}
          </>
        ) : (
          <p className="text-lg text-muted-foreground">Enter data points to calculate elasticity.</p>
        )}
      </CardContent>
    </Card>
  );
}
