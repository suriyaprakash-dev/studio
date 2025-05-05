
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
import { DollarSign, ShoppingCart, Calculator, Database, LoaderCircle } from 'lucide-react';

// Refined preprocess function to handle empty strings and non-numeric values gracefully
const preprocessNumber = (a: unknown) => {
  const strVal = String(a ?? '').trim(); // Ensure input is string, handle null/undefined defensively, trim whitespace
  if (strVal === '') return undefined; // Treat empty string as undefined for validation purposes
  const num = parseFloat(strVal);
  return isNaN(num) ? undefined : num; // Pass undefined if parsing fails, let z.number handle validation
};

const formSchema = z.object({
  initialPrice: z.preprocess(
    preprocessNumber,
    z.number({required_error: "Initial price is required", invalid_type_error: "Initial price must be a number"})
     .positive({ message: 'Initial price must be positive' })
  ),
  finalPrice: z.preprocess(
    preprocessNumber,
    z.number({required_error: "Final price is required", invalid_type_error: "Final price must be a number"})
     .positive({ message: 'Final price must be positive' })
  ),
  initialQuantity: z.preprocess(
    preprocessNumber,
     z.number({required_error: "Initial quantity is required", invalid_type_error: "Initial quantity must be a number"})
      .positive({ message: 'Initial quantity must be positive' }) // Assuming quantity must also be positive
      // If quantity can be zero, use .nonnegative()
  ),
  finalQuantity: z.preprocess(
    preprocessNumber,
    z.number({required_error: "Final quantity is required", invalid_type_error: "Final quantity must be a number"})
     .positive({ message: 'Final quantity must be positive' }) // Assuming quantity must also be positive
  ),
});


interface ElasticityFormProps {
  onCalculationStart: () => void;
  // Update the callback type to accept input data
  onCalculationEnd: (result: ElasticityResultData, inputData?: ElasticityInput) => void;
}

export function ElasticityForm({ onCalculationStart, onCalculationEnd }: ElasticityFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({ // Use inferred type from schema
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialPrice: undefined, // Keep undefined for zod validation, but handle in Input
      finalPrice: undefined,
      initialQuantity: undefined,
      finalQuantity: undefined,
    },
    // Ensure validation happens on change or blur to show errors timely
    mode: 'onChange',
  });

 // onSubmit handler uses the type inferred from the validated schema output
 const onSubmit: SubmitHandler<ElasticityInput> = async (data) => {
    setIsSubmitting(true);
    onCalculationStart(); // Notify parent component that calculation is starting
    try {
      // Data is already validated and parsed to numbers by Zod resolver
      console.log("Submitting data:", data); // Log data before sending
      const result = await calculateElasticity(data);
      console.log("Received result:", result); // Log received result
      // Pass both the result and the original input data
      onCalculationEnd(result, data);
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
           variant: "default", // Changed to default for success
         });
       }
    } catch (error) {
      console.error("Calculation failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
       // Pass only the error result, input data is irrelevant here
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
    <Card className="w-full shadow-lg-custom rounded-xl border-border/60 bg-card"> {/* Use large custom shadow */}
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
              <Database size={24} />
             Data Input
            </CardTitle>
            <CardDescription>Enter the initial and final price/quantity points.</CardDescription>
        </CardHeader>
        <CardContent>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                   <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Initial Point Group */}
                    <div className="space-y-4 p-5 bg-muted/40 rounded-lg border border-border/30 shadow-inner"> {/* Softer background, border, inner shadow */}
                      <h3 className="text-lg font-medium text-foreground mb-1">Initial Point (Point 1)</h3> {/* Adjusted margin */}
                       <FormField
                        control={form.control}
                        name="initialPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><DollarSign size={16} /> Initial Price</FormLabel> {/* Bolder label */}
                            <FormControl>
                              {/* Ensure value is controlled, passing '' for undefined */}
                              <Input type="number" placeholder="e.g., 10.00" {...field} value={field.value ?? ''} step="any" className="bg-background" /> {/* Adjusted background */}
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
                             <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><ShoppingCart size={16} /> Initial Quantity</FormLabel> {/* Bolder label */}
                            <FormControl>
                              <Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ''} step="any" className="bg-background" /> {/* Adjusted background */}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Final Point Group */}
                     <div className="space-y-4 p-5 bg-muted/40 rounded-lg border border-border/30 shadow-inner"> {/* Softer background, border, inner shadow */}
                      <h3 className="text-lg font-medium text-foreground mb-1">Final Point (Point 2)</h3> {/* Adjusted margin */}
                      <FormField
                        control={form.control}
                        name="finalPrice"
                        render={({ field }) => (
                          <FormItem>
                             <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><DollarSign size={16} /> Final Price</FormLabel> {/* Bolder label */}
                            <FormControl>
                              <Input type="number" placeholder="e.g., 12.00" {...field} value={field.value ?? ''} step="any" className="bg-background" /> {/* Adjusted background */}
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
                             <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><ShoppingCart size={16} /> Final Quantity</FormLabel> {/* Bolder label */}
                            <FormControl>
                              <Input type="number" placeholder="e.g., 80" {...field} value={field.value ?? ''} step="any" className="bg-background" /> {/* Adjusted background */}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                     </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full mt-8 text-lg py-3 rounded-lg transition-all transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98] shadow-sm"> {/* Enhanced button interaction */}
                    {isSubmitting ? (
                       <>
                         <LoaderCircle className="animate-spin mr-2" size={20} />
                         Calculating...
                       </>
                    ) : (
                        <>
                        <Calculator size={20} className="mr-2"/>
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
