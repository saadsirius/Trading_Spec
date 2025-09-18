// Mock notifications service for development
export const notificationService = {
  send: (message: string, type: string) => {
    console.log('NotificationService: Sending notification:', message, type);
    return Promise.resolve({ success: true });
  }
};
