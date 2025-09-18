// Mock AnalyticsService for development
export const analytics = {
  track: (event: string, data?: any) => {
    console.log('AnalyticsService: Tracking event:', event, data);
  },
  page: (page: string) => {
    console.log('AnalyticsService: Page view:', page);
  }
};
