// Mock cache for development
export const cache = {
  get: (key: string) => {
    console.log('Cache: Getting key:', key);
    return null;
  },
  set: (key: string, value: any, ttl?: number) => {
    console.log('Cache: Setting key:', key, 'TTL:', ttl);
  },
  del: (key: string) => {
    console.log('Cache: Deleting key:', key);
  }
};
