// Mock useAlerts for development
export const useAlerts = () => {
  const alerts = [
    {
      id: '1',
      type: 'warning',
      message: 'High volatility detected',
      timestamp: Date.now()
    }
  ];

  const dismissAlert = (id: string) => {
    console.log('Dismissing alert:', id);
  };

  const confirmAlert = (id: string) => {
    console.log('Confirming alert:', id);
  };

  const clearAll = () => {
    console.log('Clearing all alerts');
  };

  const isEnabled = true;
  const setIsEnabled = (enabled: boolean) => {
    console.log('Setting alerts enabled:', enabled);
  };

  return {
    alerts,
    dismissAlert,
    confirmAlert,
    clearAll,
    isEnabled,
    setIsEnabled
  };
};
