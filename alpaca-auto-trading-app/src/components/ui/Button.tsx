/**
 * File: src/components/ui/Button.tsx
 * Description: Variant-ready button using CVA + Tailwind + CSS Module.
 */
'use client';

import { buttonVariants } from '@/src/utils/cva-presets';
import { cn } from '@/src/utils/cn';
import styles from './Button.module.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Parameters<typeof buttonVariants>[0]['variant'];
  size?: Parameters<typeof buttonVariants>[0]['size'];
  loading?: boolean;
};

export function Button({ className, variant, size, loading, children, ...props }: ButtonProps) {
  return (
    <button
      data-variant={variant}
      data-size={size}
      className={cn('relative', styles.root, buttonVariants({ variant, size }), className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <span aria-hidden className={styles.spinner} />}
      <span className={loading ? 'opacity-80' : undefined}>{children}</span>
    </button>
  );
}
