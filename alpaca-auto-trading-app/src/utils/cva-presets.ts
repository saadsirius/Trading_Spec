/**
 * File: src/utils/cva-presets.ts
 * Description: Predefined CVA variants for common UI primitives.
 */
import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black disabled:opacity-60 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-ds-primary text-ds-primaryFg hover:bg-ds-primary/90 border border-transparent',
        ghost: 'bg-transparent text-ds-text/80 hover:bg-ds-text/5 border border-ds-border',
        danger: 'bg-ds-danger text-white hover:bg-ds-danger/90 border border-transparent'
      },
      size: {
        sm: 'h-8 px-2.5',
        md: 'h-9 px-3',
        lg: 'h-10 px-4 text-base'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export const cardVariants = cva(
  'rounded-lg border border-ds-border bg-ds-surface text-ds-text shadow-sm',
  { variants: { padded: { true: 'p-4', false: '' } }, defaultVariants: { padded: true } }
);
