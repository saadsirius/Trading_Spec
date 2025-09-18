import { atom, selector } from 'recoil';

export const roiSymbolAtom = atom<string>({ 
  key: 'roi.symbol', 
  default: 'SPY' 
});

export const pricesAtom = atom<number[]>({ 
  key: 'market.prices', 
  default: [] 
});

export const roiTargetAtom = atom<number>({ 
  key: 'roi.target', 
  default: 0.02 
});

export const returnsSel = selector<number[]>({
  key: 'market.returns',
  get: ({ get }) => {
    const px = get(pricesAtom); 
    const out: number[] = []; 
    for (let i = 1; i < px.length; i++) {
      out.push((px[i] - px[i - 1]) / (px[i - 1] || 1));
    }
    return out;
  }
});
