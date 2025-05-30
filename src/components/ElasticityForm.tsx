
'use client';

import * as React from 'react';
import { useForm, type SubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Removed Label import as FormLabel is used
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { ElasticityInput, ElasticityResultData } from '@/app/actions';
import { calculateElasticity } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, ShoppingCart, Calculator, Database, LoaderCircle, PlusCircle, Trash2 } from 'lucide-react';

const preprocessNumber = (a: unknown) => {
  const strVal = String(a ?? '').trim();
  if (strVal === '') return undefined;
  const num = parseFloat(strVal);
  return isNaN(num) ? undefined : num;
};

const dataPointSchema = z.object({
  price: z.preprocess(
    preprocessNumber,
    z.number({ required_error: "Price is required", invalid_type_error: "Price must be a number" })
     .positive({ message: 'Price must be positive' })
  ),
  quantity: z.preprocess(
    preprocessNumber,
     z.number({ required_error: "Quantity is required", invalid_type_error: "Quantity must be a number" })
      .positive({ message: 'Quantity must be positive' })
  ),
});

const formSchema = z.object({
  points: z.array(dataPointSchema)
    .min(2, { message: 'At least two data points are required.' })
    .max(100, {message: 'Maximum of 100 data points allowed.'}) // Added a max for sensibility
});

type FormValues = z.infer<typeof formSchema>;

interface ElasticityFormProps {
  onCalculationStart: () => void;
  onCalculationEnd: (result: ElasticityResultData, inputData?: FormValues) => void;
}

const defaultTwoPoints = Array(2).fill(null).map(() => ({ price: undefined, quantity: undefined }));
const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ElasticityForm({ onCalculationStart, onCalculationEnd }: ElasticityFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      points: defaultTwoPoints, // Reverted to 2 default points
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "points"
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    onCalculationStart();
    try {
      console.log("Submitting data:", data);
      const result = await calculateElasticity(data);
      console.log("Received result:", result);
      onCalculationEnd(result, data);
        if (result.error) {
         toast({
           title: "Calculation Error",
           description: result.error,
           variant: "destructive",
         });
       } else {
          let toastDescription = `Price Elasticity: ${isFinite(result.elasticity) ? result.elasticity.toFixed(3) : (result.elasticity > 0 ? '∞' : '-∞')}.`;
          if (data.points.length > 2) {
            toastDescription += " Calculated using first and last data points."
          }
         toast({
           title: "Calculation Successful",
           description: toastDescription,
           variant: "default",
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
    <Card className="w-full shadow-lg-custom rounded-xl border-border/60 bg-card">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
              <Database size={24} />
             Data Input
            </CardTitle>
            <CardDescription>
              Enter at least two data points. Add more to see trends (e.g., monthly data for a year).
              The primary PED calculation uses the first and last points of your series if more than two are entered.
              The graph will visualize all entered points.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    {fields.map((item, index) => (
                      <div key={item.id} className="p-5 bg-muted/40 rounded-lg border border-border/30 shadow-inner space-y-4 relative">
                        <div className="flex justify-between items-center mb-2">
                           <h3 className="text-lg font-medium text-foreground">
                            Data Point {index + 1} {fields.length <= 12 && index < monthNamesShort.length ? `(${monthNamesShort[index]})` : ''}
                          </h3>
                          {fields.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 absolute top-3 right-3"
                              onClick={() => remove(index)}
                            >
                              <Trash2 size={16} />
                              <span className="sr-only">Remove Point {index + 1}</span>
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`points.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><DollarSign size={16} /> Price</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="e.g., 10.00"
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(preprocessNumber(e.target.value))}
                                    step="any"
                                    className="bg-background" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`points.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5 text-sm font-medium"><ShoppingCart size={16} /> Quantity</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="e.g., 100"
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(preprocessNumber(e.target.value))}
                                    step="any"
                                    className="bg-background" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {form.formState.errors.points && !form.formState.errors.points.root && (
                    <FormMessage>{form.formState.errors.points.message}</FormMessage>
                  )}
                  {form.formState.errors.points?.root && (
                     <FormMessage>{form.formState.errors.points.root.message}</FormMessage>
                  )}


                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({ price: undefined, quantity: undefined })}
                      className="w-full sm:w-auto flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <PlusCircle size={18} /> Add Data Point
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !form.formState.isValid} className="w-full sm:flex-1 text-lg py-3 rounded-lg transition-all transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98] shadow-sm">
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
                  </div>
                </form>
             </Form>
        </CardContent>
    </Card>
  );
}
