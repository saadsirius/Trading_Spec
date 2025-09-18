// Mock calendar API for development
export const calendarAPI = {
  getEvents: (date: string) => {
    console.log('CalendarAPI: Getting events for:', date);
    return Promise.resolve({ events: [] });
  }
};

export const fetchCalendar = async (symbol?: string) => {
  console.log('CalendarAPI: Fetching calendar for:', symbol);
  return { events: [] };
};