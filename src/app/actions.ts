'use server';

import { z } from 'zod';

const ElasticityInputSchema = z.object({
  initialPrice: z.number().positive('Initial price must be positive'),
  finalPrice: z.number().positive('Final price must be positive'),
  initialQuantity: z.number().positive('Initial quantity must be positive'),
  finalQuantity: z.number().positive('Final quantity must be positive'),
});

export type ElasticityInput = z.infer<typeof ElasticityInputSchema>;

export type ElasticityResultData = {
  elasticity: number;
  classification: 'Elastic' | 'Inelastic' | 'Unit Elastic' | 'Perfectly Inelastic' | 'Perfectly Elastic' | 'Invalid Input';
  error?: string;
};

export async function calculateElasticity(
  input: ElasticityInput
): Promise<ElasticityResultData> {
  const validation = ElasticityInputSchema.safeParse(input);

  if (!validation.success) {
    return {
      elasticity: NaN,
      classification: 'Invalid Input',
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { initialPrice, finalPrice, initialQuantity, finalQuantity } = validation.data;

  const deltaQ = finalQuantity - initialQuantity;
  const deltaP = finalPrice - initialPrice;
  const avgQ = (finalQuantity + initialQuantity) / 2;
  const avgP = (finalPrice + initialPrice) / 2;

  // Handle edge cases: no change in price or quantity
  if (deltaP === 0 && deltaQ === 0) {
    return { elasticity: NaN, classification: 'Invalid Input', error: "Price and quantity haven't changed." };
  }
  if (deltaP === 0) {
     // Price constant, quantity changed -> Perfectly Elastic
    return { elasticity: Infinity, classification: 'Perfectly Elastic' };
  }
   if (deltaQ === 0) {
    // Quantity constant, price changed -> Perfectly Inelastic
    return { elasticity: 0, classification: 'Perfectly Inelastic' };
  }

  // Handle division by zero for average quantity or price (shouldn't happen with positive inputs, but good practice)
  if (avgQ === 0 || avgP === 0) {
      return { elasticity: NaN, classification: 'Invalid Input', error: 'Average price or quantity cannot be zero.' };
  }


  const percentageChangeQ = deltaQ / avgQ;
  const percentageChangeP = deltaP / avgP;

  const elasticity = percentageChangeQ / percentageChangeP;
  const absElasticity = Math.abs(elasticity);

  let classification: ElasticityResultData['classification'];
  if (absElasticity > 1) {
    classification = 'Elastic';
  } else if (absElasticity < 1 && absElasticity > 0) {
    classification = 'Inelastic';
  } else if (absElasticity === 1) {
    classification = 'Unit Elastic';
  } else if (absElasticity === 0) {
      classification = 'Perfectly Inelastic';
  } else {
    // This case might occur if elasticity is exactly Infinity or -Infinity handled above, or NaN
    classification = 'Invalid Input'; // Default or error case
  }


  return { elasticity, classification };
}
