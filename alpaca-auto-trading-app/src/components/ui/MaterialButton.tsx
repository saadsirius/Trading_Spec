'use client';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

interface MaterialButtonProps extends ButtonProps {
  ripple?: boolean;
  animated?: boolean;
}

export default function MaterialButton({ 
  children, 
  ripple = true, 
  animated = true,
  ...props 
}: MaterialButtonProps) {
  const ButtonComponent = animated ? motion(StyledButton) : StyledButton;
  
  const motionProps = animated ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  } : {};

  return (
    <ButtonComponent
      {...motionProps}
      {...props}
      disableRipple={!ripple}
    >
      {children}
    </ButtonComponent>
  );
}
