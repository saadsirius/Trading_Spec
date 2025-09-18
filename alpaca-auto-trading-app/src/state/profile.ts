'use client';
import { create } from 'zustand';

export type Holding = { symbol: string; pct?: number };
export type Goal = { type: 'retirement'|'income'|'buy_house'|'education'|'custom'; amount?: number; label?: string };
export type UserProfile = {
  email: string;
  displayName?: string;
  riskLevel: 1|2|3;
  horizonYears: number;
  incomeYear?: number;
  savingsRate?: number;
  goals: Goal[];
  holdings: Holding[];
};

type ProfileState = {
  profile: UserProfile | null;
  setProfile: (p: Partial<UserProfile>) => void;
  save: () => Promise<void>;
  load: (email: string) => Promise<void>;
};

export const useProfile = create<ProfileState>((set, get) => ({
  profile: null,
  setProfile(p) { set({ profile: { ...(get().profile ?? { email:'' , riskLevel:2, horizonYears:5, goals:[], holdings:[] }), ...p } as any }); },
  async save() {
    const body = get().profile;
    if (!body) return;
    await fetch('/api/user/profile', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
  },
  async load(email) {
    const r = await fetch(`/api/user/profile?email=${encodeURIComponent(email)}`);
    const j = await r.json().catch(()=>({}));
    if (j?.profile) set({ profile: j.profile as UserProfile });
    else set({ profile: { email, riskLevel:2, horizonYears:5, goals:[], holdings:[] } });
  },
}));
