// Mock server flags for development
export const serverFlags = {
  isEnabled: (flag: string) => {
    return true;
  },
  getValue: (flag: string) => {
    return 'default';
  }
};
