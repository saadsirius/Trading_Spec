/**
 * File: src/types/utils.d.ts
 * Description: Utility types and interfaces.
 */
export interface NumberFormatOptions {
  decimals?: number;
  prefix?: string;
  suffix?: string;
  thousandSeparator?: string;
  decimalSeparator?: string;
}

export function formatNumber(value: number, options?: NumberFormatOptions): string;
export function formatCurrency(value: number, currency?: string): string;
export function formatPercentage(value: number, decimals?: number): string;
