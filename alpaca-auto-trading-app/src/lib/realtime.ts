// Mock realtime service for development
export const realtime = {
  subscribe: (channel: string, callback: (data: any) => void) => {
    console.log('Realtime: Subscribing to channel:', channel);
  },
  unsubscribe: (channel: string) => {
    console.log('Realtime: Unsubscribing from channel:', channel);
  }
};
