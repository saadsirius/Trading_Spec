'use client';
import { PnLPoint } from '@/src/types/market';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function PnLCumulated({ data }: { data: PnLPoint[] }) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" minTickGap={24}/>
          <YAxis tickFormatter={(v)=> (v>1e6? (v/1e6).toFixed(1)+'M': v>1e3? (v/1e3).toFixed(1)+'k': v.toFixed(0))}/>
          <Tooltip formatter={(v)=> Number(v).toFixed(2)} />
          <Line type="monotone" dataKey="pnl" dot={false} strokeWidth={2}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
