import { VatCategory } from '@prisma/client';

const DEFAULT_VAT_RATE = 0.075;

export function resolveVatRate(category: VatCategory): number {
  if (category === VatCategory.STANDARD) return DEFAULT_VAT_RATE;
  return 0;
}

export function computeVatInclusiveLine(quantity: number, unitPriceKobo: number, category: VatCategory) {
  const taxableAmountKobo = Math.round(quantity * unitPriceKobo);
  const rate = resolveVatRate(category);
  const vatAmountKobo = Math.round(taxableAmountKobo * rate);
  return {
    rate,
    taxableAmountKobo,
    vatAmountKobo,
    lineTotalKobo: taxableAmountKobo + vatAmountKobo
  };
}
