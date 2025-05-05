'use server';

import { z } from 'zod';

const ElasticityInputSchema = z.object({
  initialPrice: z.number().positive('Initial price must be positive'),
  finalPrice: z.number().positive('Final price must be positive'),
  initialQuantity: z.number().positive('Initial quantity must be positive'),
  finalQuantity: z.number().positive('Final quantity must be positive'),
});

export type ElasticityInput = z.infer<typeof ElasticityInputSchema>;

// Add percentage changes to the result data
export type ElasticityResultData = {
  elasticity: number;
  classification: 'Elastic' | 'Inelastic' | 'Unit Elastic' | 'Perfectly Inelastic' | 'Perfectly Elastic' | 'Invalid Input';
  percentageChangeQ?: number; // Absolute percentage change in quantity
  percentageChangeP?: number; // Absolute percentage change in price
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
     // Percentage changes: P=0, Q is relative change
     const percentageChangeQ = avgQ !== 0 ? Math.abs(deltaQ / avgQ) : Infinity;
    return { elasticity: Infinity, classification: 'Perfectly Elastic', percentageChangeQ: percentageChangeQ, percentageChangeP: 0 };
  }
   if (deltaQ === 0) {
    // Quantity constant, price changed -> Perfectly Inelastic
    // Percentage changes: Q=0, P is relative change
    const percentageChangeP = avgP !== 0 ? Math.abs(deltaP / avgP) : Infinity;
    return { elasticity: 0, classification: 'Perfectly Inelastic', percentageChangeQ: 0, percentageChangeP: percentageChangeP };
  }

  // Handle division by zero for average quantity or price (shouldn't happen with positive inputs validation, but good practice)
  if (avgQ === 0 || avgP === 0) {
      return { elasticity: NaN, classification: 'Invalid Input', error: 'Average price or quantity cannot be zero.' };
  }


  const percentageChangeQRaw = deltaQ / avgQ;
  const percentageChangePRaw = deltaP / avgP;

  const elasticity = percentageChangeQRaw / percentageChangePRaw;
  const absElasticity = Math.abs(elasticity);

  // Calculate absolute percentage changes for the chart
  const absPercentageChangeQ = Math.abs(percentageChangeQRaw);
  const absPercentageChangeP = Math.abs(percentageChangePRaw);


  let classification: ElasticityResultData['classification'];
  if (absElasticity > 1) {
    classification = 'Elastic';
  } else if (absElasticity < 1 && absElasticity > 0) {
    classification = 'Inelastic';
  } else if (absElasticity === 1) {
    classification = 'Unit Elastic';
  } else if (absElasticity === 0) {
      classification = 'Perfectly Inelastic';
  } else if (!isFinite(absElasticity)) {
       classification = 'Perfectly Elastic'; // Handle Infinity case from deltaP=0
  }
   else {
    // This case might occur if elasticity is NaN for other reasons
    classification = 'Invalid Input'; // Default or error case
  }


  return {
      elasticity,
      classification,
      percentageChangeQ: absPercentageChangeQ,
      percentageChangeP: absPercentageChangeP
    };
}
