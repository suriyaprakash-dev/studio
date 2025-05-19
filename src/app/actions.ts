
'use server';

import { z } from 'zod';

// Schema for a single data point
const DataPointSchema = z.object({
  price: z.number().positive('Price must be positive'),
  quantity: z.number().positive('Quantity must be positive'),
});

// Updated schema to accept an array of data points
const ElasticityInputSchema = z.object({
  points: z.array(DataPointSchema).min(2, 'At least two data points are required for calculation'),
});

export type ElasticityInput = z.infer<typeof ElasticityInputSchema>;
export type DataPoint = z.infer<typeof DataPointSchema>; // Export for form usage

export type ElasticityResultData = {
  elasticity: number;
  classification: 'Elastic' | 'Inelastic' | 'Unit Elastic' | 'Perfectly Inelastic' | 'Perfectly Elastic' | 'Invalid Input';
  percentageChangeQ?: number;
  percentageChangeP?: number;
  error?: string;
  pointsUsed?: { start: DataPoint, end: DataPoint };
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

  const { points } = validation.data;

  // Use the first and last points for PED calculation if more than two are provided.
  // Otherwise, use the first two (which is covered by points.length >= 2 validation)
  const initialPoint = points[0];
  const finalPoint = points[points.length - 1];

  const initialPrice = initialPoint.price;
  const finalPrice = finalPoint.price;
  const initialQuantity = initialPoint.quantity;
  const finalQuantity = finalPoint.quantity;

  const deltaQ = finalQuantity - initialQuantity;
  const deltaP = finalPrice - initialPrice;
  const avgQ = (finalQuantity + initialQuantity) / 2;
  const avgP = (finalPrice + initialPrice) / 2;

  if (deltaP === 0 && deltaQ === 0) {
    return { elasticity: NaN, classification: 'Invalid Input', error: "Price and quantity haven't changed between the selected data points.", pointsUsed: { start: initialPoint, end: finalPoint } };
  }
  if (deltaP === 0) {
     const percentageChangeQ = avgQ !== 0 ? Math.abs(deltaQ / avgQ) : Infinity;
    return { elasticity: Infinity, classification: 'Perfectly Elastic', percentageChangeQ: percentageChangeQ, percentageChangeP: 0, pointsUsed: { start: initialPoint, end: finalPoint } };
  }
   if (deltaQ === 0) {
    const percentageChangeP = avgP !== 0 ? Math.abs(deltaP / avgP) : Infinity;
    return { elasticity: 0, classification: 'Perfectly Inelastic', percentageChangeQ: 0, percentageChangeP: percentageChangeP, pointsUsed: { start: initialPoint, end: finalPoint } };
  }

  if (avgQ === 0 || avgP === 0) {
      return { elasticity: NaN, classification: 'Invalid Input', error: 'Average price or quantity (for the selected data points) cannot be zero.', pointsUsed: { start: initialPoint, end: finalPoint } };
  }

  const percentageChangeQRaw = deltaQ / avgQ;
  const percentageChangePRaw = deltaP / avgP;

  const elasticity = percentageChangeQRaw / percentageChangePRaw;
  const absElasticity = Math.abs(elasticity);

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
       classification = 'Perfectly Elastic';
  } else {
    classification = 'Invalid Input';
  }

  return {
      elasticity,
      classification,
      percentageChangeQ: absPercentageChangeQ,
      percentageChangeP: absPercentageChangeP,
      pointsUsed: { start: initialPoint, end: finalPoint }
    };
}
