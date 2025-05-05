'use client';

import * as React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { ElasticityInput, ElasticityResultData } from '@/app/actions';
import { calculateElasticity } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, ShoppingCart, Calculator } from 'lucide-react';


const formSchema = z.object({
  initialPrice: z.preprocess(
    (a) => parseFloat(z.string().min(1, "Initial price is required").parse(a)),
    z.number({invalid_type_error: "Initial price must be a number"}).positive('Initial price must be positive')
  ),
  finalPrice: z.preprocess(
    (a) => parseFloat(z.string().min(1, "Final price is required").parse(a)),
    z.number({invalid_type_error: "Final price must be a number"}).positive('Final price must be positive')
  ),
  initialQuantity: z.preprocess(
    (a) => parseFloat(z.string().min(1, "Initial quantity is required").parse(a)),
     z.number({invalid_type_error: "Initial quantity must be a number"}).positive('Initial quantity must be positive')
  ),
  finalQuantity: z.preprocess(
    (a) => parseFloat(z.string().min(1, "Final quantity is required").parse(a)),
    z.number({invalid_type_error: "Final quantity must be a number"}).positive('Final quantity must be positive')
  ),
});


interface ElasticityFormProps {
  onCalculationStart: () => void;
  onCalculationEnd: (result: ElasticityResultData) => void;
}

export function ElasticityForm({ onCalculationStart, onCalculationEnd }: ElasticityFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ElasticityInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialPrice: undefined,
      finalPrice: undefined,
      initialQuantity: undefined,
      finalQuantity: undefined,
    },
  });

 const onSubmit: SubmitHandler<ElasticityInput> = async (data) => {
    setIsSubmitting(true);
    onCalculationStart(); // Notify parent component that calculation is starting
    try {
      console.log("Submitting data:", data); // Log data before sending
      const result = await calculateElasticity(data);
      console.log("Received result:", result); // Log received result
      onCalculationEnd(result); // Send result to parent component
        if (result.error) {
         toast({
           title: "Calculation Error",
           description: result.error,
           variant: "destructive",
         });
       } else {
         toast({
           title: "Calculation Successful",
           description: `Price Elasticity: ${isFinite(result.elasticity) ? result.elasticity.toFixed(3) : (result.elasticity > 0 ? '∞' : '-∞')}`,
           variant: "default", // Use default (blue theme) or 'success' if defined
         });
       }
    } catch (error) {
      console.error("Calculation failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
       onCalculationEnd({ elasticity: NaN, classification: 'Invalid Input', error: errorMessage });
      toast({
        title: "Calculation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Card className="w-full shadow-md">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-database"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
             Data Input
            </CardTitle>
            <CardDescription>Enter the initial and final price/quantity points.</CardDescription>
        </CardHeader>
        <CardContent>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                   <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Initial Point */}
                    <Card className="p-4 bg-secondary/30">
                      <h3 className="text-lg font-medium mb-3">Initial Point (Point 1)</h3>
                       <FormField
                        control={form.control}
                        name="initialPrice"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel className="flex items-center gap-1"><DollarSign size={16} /> Initial Price</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 10.00" {...field} step="any" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="initialQuantity"
                        render={({ field }) => (
                          <FormItem>
                             <FormLabel className="flex items-center gap-1"><ShoppingCart size={16} /> Initial Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 100" {...field} step="any" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Card>

                    {/* Final Point */}
                     <Card className="p-4 bg-secondary/30">
                      <h3 className="text-lg font-medium mb-3">Final Point (Point 2)</h3>
                      <FormField
                        control={form.control}
                        name="finalPrice"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                             <FormLabel className="flex items-center gap-1"><DollarSign size={16} /> Final Price</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 12.00" {...field} step="any" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="finalQuantity"
                        render={({ field }) => (
                          <FormItem>
                             <FormLabel className="flex items-center gap-1"><ShoppingCart size={16} /> Final Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 80" {...field} step="any" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                     </Card>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full mt-6">
                    {isSubmitting ? (
                       <>
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-loader-circle animate-spin mr-2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                         Calculating...
                       </>
                    ) : (
                        <>
                        <Calculator size={18} className="mr-2"/>
                         Calculate Elasticity
                       </>
                    )}
                  </Button>
                </form>
             </Form>
        </CardContent>
    </Card>
  );
}
