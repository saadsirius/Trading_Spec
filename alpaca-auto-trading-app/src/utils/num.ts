/**
 * File: src/utils/num.ts
 * Description: Number formatting utilities.
 */
export interface NumberFormatOptions {
  decimals?: number;
  prefix?: string;
  suffix?: string;
  thousandSeparator?: string;
  decimalSeparator?: string;
}

export function formatNumber(value: number, options: NumberFormatOptions = {}): string {
  const {
    decimals = 2,
    prefix = '',
    suffix = '',
    thousandSeparator = ',',
    decimalSeparator = '.',
  } = options;

  const formatted = value.toFixed(decimals);
  const [integer, decimal] = formatted.split('.');
  
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
  const result = decimal ? `${formattedInteger}${decimalSeparator}${decimal}` : formattedInteger;
  
  return `${prefix}${result}${suffix}`;
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}