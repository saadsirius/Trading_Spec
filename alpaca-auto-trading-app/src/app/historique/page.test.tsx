import { describe, it, expect } from 'vitest';
import HistoriquePage from './page';

describe('HistoriquePage', ()=>{
  it('renders server component', async ()=>{
    const comp = await HistoriquePage({ searchParams: { symbol:'AAPL' } } as any);
    expect(comp).toBeTruthy();
  });
});
