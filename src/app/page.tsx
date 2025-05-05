'use client';

import * as React from 'react';
import { ElasticityForm } from '@/components/ElasticityForm';
import { ElasticityResult } from '@/components/ElasticityResult';
import type { ElasticityResultData } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


export default function Home() {
  const [result, setResult] = React.useState<ElasticityResultData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCalculationStart = () => {
    setIsLoading(true);
    setResult(null); // Clear previous results
  };

  const handleCalculationEnd = (calculationResult: ElasticityResultData) => {
    setResult(calculationResult);
    setIsLoading(false);
  };


  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 bg-background">
        <header className="w-full max-w-4xl mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">PriceLens</h1>
            <p className="text-lg text-muted-foreground">Analyze Price Elasticity of Demand</p>
             <Separator className="my-4" />
             <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                Understand how changes in price affect consumer demand for your product. Input the price and quantity data points below to calculate the Price Elasticity of Demand (PED) using the midpoint formula.
            </p>
        </header>

        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="lg:col-span-1">
             <ElasticityForm
                onCalculationStart={handleCalculationStart}
                onCalculationEnd={handleCalculationEnd}
             />
           </div>
           <div className="lg:col-span-1">
              <ElasticityResult result={result} isLoading={isLoading} />
           </div>
        </div>

        <Card className="w-full max-w-4xl mt-8 shadow-sm border-dashed">
            <CardHeader>
                <CardTitle className="text-xl">Understanding the Results</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong className="text-foreground">Elastic (PED &gt; 1):</strong> A small price change leads to a large change in quantity demanded. Demand is sensitive.</p>
                <p><strong className="text-foreground">Inelastic (PED &lt; 1):</strong> A price change leads to a smaller change in quantity demanded. Demand is not very sensitive.</p>
                <p><strong className="text-foreground">Unit Elastic (PED = 1):</strong> Percentage change in quantity equals the percentage change in price.</p>
                <p><strong className="text-foreground">Perfectly Inelastic (PED = 0):</strong> Quantity demanded does not change with price (theoretical).</p>
                <p><strong className="text-foreground">Perfectly Elastic (PED = ∞):</strong> Infinite demand at a specific price (theoretical).</p>
            </CardContent>
        </Card>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} PriceLens. Built with Next.js and ShadCN UI.</p>
        </footer>
    </main>
  );
}
