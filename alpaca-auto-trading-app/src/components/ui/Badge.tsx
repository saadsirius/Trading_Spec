/**
 * File: src/components/ui/Badge.tsx
 * Description: CSS Module-only badge, no CVA necessary.
 */
'use client';
import clsx from 'clsx';
import styles from './Badge.module.css';

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'neutral' | 'success' | 'warning' | 'danger';
};

export function Badge({ className, variant = 'neutral', ...rest }: Props) {
  return <span data-variant={variant} className={clsx(styles.badge, className)} {...rest} />;
}
