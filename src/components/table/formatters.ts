
/**
 * Formats a number as currency with comma as decimal separator and Euro symbol
 */
export const formatCurrency = (amount: number): string => {
  // Format with 2 decimals and replace dot with comma
  return amount.toFixed(2).replace('.', ',') + ' €';
};
