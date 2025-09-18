import { createSchema, createYoga } from '@graphql-yoga/node';

const typeDefs = /* GraphQL */ `
  type Ticker { 
    symbol: String!
    price: Float
    change1d: Float
    change1w: Float
    change1m: Float
  }
  type Query {
    quote(symbol: String!): Ticker
    search(q: String!): [Ticker!]!
  }
`;

const resolvers = {
  Query: {
    async quote(_: any, { symbol }: any) {
      const j = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/alpaca/market/bars?symbols=${symbol}&timeframe=1Day&limit=30`
      ).then(r => r.json());
      
      const arr = j?.bars?.[symbol] || []; 
      if (!arr.length) return { symbol };
      
      const p = arr.at(-1).c;
      const d = arr.at(-2)?.c || p;
      const w = arr.at(-6)?.c || p;
      const m = arr.at(-21)?.c || p;
      const pct = (a: number, b: number) => (a - b) / (b || 1);
      
      return { 
        symbol, 
        price: p, 
        change1d: pct(p, d), 
        change1w: pct(p, w), 
        change1m: pct(p, m) 
      };
    },
    async search(_: any, { q }: any) {
      const j = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/search?q=${encodeURIComponent(q)}`
      ).then(r => r.json());
      
      return (j.items || []).map((x: any) => ({ 
        symbol: x.symbol, 
        price: x.price, 
        change1d: x.change1d, 
        change1w: x.change1w, 
        change1m: x.change1m 
      }));
    }
  }
};

const yoga = createYoga({ 
  schema: createSchema({ typeDefs, resolvers }) 
});

export { yoga as GET, yoga as POST };
