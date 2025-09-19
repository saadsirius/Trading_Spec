/**
 * File: src/components/ui/Card.tsx
 * Description: Simple surface container with optional padding (CVA).
 */
'use client';

import { cardVariants } from '@/src/utils/cva-presets';
import { cn } from '@/src/utils/cn';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

export function Card({ className, padded = true, ...rest }: CardProps) {
  return <div className={cn(cardVariants({ padded }), className)} {...rest} />;
}
