// Mock news API for development
export const newsAPI = {
  getHeadlines: (symbol: string) => {
    console.log('NewsAPI: Getting headlines for:', symbol);
    return Promise.resolve({ headlines: [] });
  }
};

export const fetchNews = async (symbol?: string) => {
  console.log('NewsAPI: Fetching news for:', symbol);
  return { headlines: [] };
};