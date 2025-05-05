'use client';

import * as React from 'react';
import { ElasticityForm } from '@/components/ElasticityForm';
import { ElasticityResult } from '@/components/ElasticityResult';
import type { ElasticityResultData } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Target } from 'lucide-react'; // Import Target icon

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
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 lg:p-16">
        <header className="w-full max-w-5xl mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3 flex items-center justify-center gap-3">
              <Target size={36} className="text-primary"/> PriceLens
            </h1>
            <p className="text-xl text-muted-foreground">Analyze Price Elasticity of Demand</p>
             <Separator className="my-6 max-w-md mx-auto" />
             <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Gain insights into how price adjustments impact consumer demand. Input your initial and final price and quantity data points below to compute the Price Elasticity of Demand (PED) using the midpoint formula, helping you make informed pricing decisions.
            </p>
        </header>

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
           <div className="lg:col-span-3">
             <ElasticityForm
                onCalculationStart={handleCalculationStart}
                onCalculationEnd={handleCalculationEnd}
             />
           </div>
           <div className="lg:col-span-2">
              <ElasticityResult result={result} isLoading={isLoading} />
           </div>
        </div>

        <Card className="w-full max-w-5xl mt-12 shadow-lg rounded-xl border-border/60 card-hover-effect">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold">Understanding Elasticity</CardTitle>
                 <CardDescription>Interpret your PED result:</CardDescription>
            </CardHeader>
            <CardContent className="text-base text-muted-foreground space-y-3">
                <p><strong className="font-medium text-foreground">Elastic (PED &gt; 1):</strong> Demand is highly responsive to price changes. A price decrease could significantly boost quantity sold, potentially increasing revenue.</p>
                <p><strong className="font-medium text-foreground">Inelastic (0 &lt; PED &lt; 1):</strong> Demand is relatively unresponsive to price changes. A price increase might lead to higher revenue despite a small drop in quantity sold.</p>
                <p><strong className="font-medium text-foreground">Unit Elastic (PED = 1):</strong> Percentage change in quantity demanded perfectly matches the percentage change in price. Revenue is likely maximized at the current price point.</p>
                <p><strong className="font-medium text-foreground">Perfectly Inelastic (PED = 0):</strong> Quantity demanded remains constant regardless of price changes (rare in practice, often applies to essential goods with no substitutes).</p>
                <p><strong className="font-medium text-foreground">Perfectly Elastic (PED = ∞):</strong> Consumers demand an infinite quantity at a specific price, but none above it (theoretical, seen in perfectly competitive markets).</p>
            </CardContent>
        </Card>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} PriceLens. Powered by Next.js & ShadCN UI.</p>
        </footer>
    </main>
  );
}
