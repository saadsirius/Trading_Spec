// Mock trading validations for development
export const validateOrder = (order: any) => {
  return { valid: true, errors: [] };
};

export const validateSymbol = (symbol: string) => {
  return symbol.length > 0;
};
