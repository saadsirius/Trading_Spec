// Mock database for development
export const db = {
  query: (sql: string, params?: any[]) => {
    console.log('DB: Query:', sql, params);
    return Promise.resolve([]);
  },
  transaction: (callback: (tx: any) => Promise<any>) => {
    console.log('DB: Transaction started');
    return callback({});
  }
};
