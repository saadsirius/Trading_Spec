/**
 * File: src/components/ui/MaterialButton.tsx
 * Description: Material-UI Button component with Framer Motion animations.
 */
'use client';

import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { motion } from 'framer-motion';

interface MaterialButtonProps extends Omit<ButtonProps, 'onDrag'> {
  loading?: boolean;
  children: React.ReactNode;
}

export default function MaterialButton({
  loading = false,
  children,
  disabled,
  ...props
}: MaterialButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Button
        {...props}
        disabled={disabled || loading}
        disableRipple
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
          px: 3,
          py: 1.5,
          ...props.sx,
        }}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ marginRight: 8 }}
          >
            ⟳
          </motion.div>
        ) : null}
        {children}
      </Button>
    </motion.div>
  );
}