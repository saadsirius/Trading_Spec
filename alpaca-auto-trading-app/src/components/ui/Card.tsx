/**
 * File: src/components/ui/Card.tsx
 * Description: Simple surface container with optional padding (CVA).
 */
'use client';

import { cardVariants } from '@/utils/cva-presets';
import { cn } from '@/utils/cn';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

export function Card({ className, padded = true, ...rest }: CardProps) {
  return <div className={cn(cardVariants({ padded }), className)} {...rest} />;
}
