// Mock eventBus for development
export const eventBus = {
  emit: (event: string, data?: any) => {
    console.log('EventBus: Emitting event:', event, data);
  },
  on: (event: string, callback: (data?: any) => void) => {
    console.log('EventBus: Listening to event:', event);
  },
  off: (event: string, callback: (data?: any) => void) => {
    console.log('EventBus: Removing listener for event:', event);
  }
};
