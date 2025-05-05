import type { ElasticityResultData } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ElasticityResultProps {
  result: ElasticityResultData | null;
  isLoading: boolean;
}

function getBadgeVariant(classification: ElasticityResultData['classification']): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (classification) {
        case 'Elastic':
        case 'Perfectly Elastic':
            return 'default'; // Blue badge for elastic
        case 'Inelastic':
        case 'Perfectly Inelastic':
            return 'secondary'; // Gray badge for inelastic
        case 'Unit Elastic':
            return 'outline'; // Outline badge for unit elastic
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
            return <TrendingUp className="h-5 w-5 text-green-500" />; // Use actual color here
        case 'Inelastic':
        case 'Perfectly Inelastic':
            return <TrendingDown className="h-5 w-5 text-orange-500" />; // Use actual color here
        case 'Unit Elastic':
            return <Minus className="h-5 w-5 text-yellow-500" />; // Use actual color here
        default:
            return null;
    }
}

function getDescription(classification: ElasticityResultData['classification']): string {
    switch (classification) {
        case 'Elastic':
            return 'Demand is sensitive to price changes. Lowering prices might increase total revenue.';
        case 'Inelastic':
            return 'Demand is not very sensitive to price changes. Raising prices might increase total revenue.';
        case 'Unit Elastic':
            return 'Percentage change in quantity demanded is equal to the percentage change in price. Revenue is maximized.';
         case 'Perfectly Inelastic':
            return 'Quantity demanded does not change regardless of price changes (theoretical).';
        case 'Perfectly Elastic':
            return 'Consumers will demand an infinite quantity at a specific price, but none at a higher price (theoretical).';
        case 'Invalid Input':
            return 'Please check your input values. Ensure prices and quantities are positive and changes occurred.';
        default:
            return 'Enter data and calculate to see the result.';
    }
}


export function ElasticityResult({ result, isLoading }: ElasticityResultProps) {
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-big"><line x1="12" x2="12" y1="20" y2="4"/><path d="M17 20v-6"/><path d="M22 20v-10"/><path d="M7 20v-2"/><path d="M2 20v-4"/></svg>
          Analysis Results
        </CardTitle>
        <CardDescription>Price Elasticity of Demand (PED)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
           <div className="flex items-center justify-center p-8">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-loader-circle animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
             <span className="ml-2">Calculating...</span>
           </div>
        ) : result ? (
          <>
            {result.error ? (
               <Badge variant={getBadgeVariant(result.classification)} className="text-lg">
                 {result.classification}
               </Badge>
            ) : (
             <div className="flex items-center justify-between">
                 <span className="text-3xl font-bold">
                    {isFinite(result.elasticity) ? result.elasticity.toFixed(3) : (result.elasticity > 0 ? '∞' : '-∞')}
                 </span>
                 <Badge variant={getBadgeVariant(result.classification)} className="text-lg flex items-center gap-1">
                    {getIcon(result.classification)}
                    {result.classification}
                 </Badge>
             </div>
            )}

            <p className="text-muted-foreground pt-2">{getDescription(result.classification)}</p>
             {result.error && <p className="text-sm text-destructive mt-2">{result.error}</p>}
          </>
        ) : (
          <p className="text-muted-foreground text-center p-8">Enter data points to calculate elasticity.</p>
        )}
      </CardContent>
    </Card>
  );
}
