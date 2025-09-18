export const DS = {
  radius: 10,
  spacing: (n = 1) => `${n * 8}px`,
  z: { toast: 40, modal: 50, coach: 60 },
  shadow: 'var(--ds-shadow)',
  color: {
    bg: 'var(--ds-bg)', 
    fg: 'var(--ds-fg)', 
    muted: 'var(--ds-muted)',
    primary: 'var(--ds-primary)', 
    accent: 'var(--ds-accent)',
    success: 'var(--ds-success)', 
    danger: 'var(--ds-danger)', 
    border: 'var(--ds-border)',
    card: 'var(--ds-card)',
  }
};
