'use client';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { useMemo } from 'react';

type Props = {
  startValue: number;
  years: number;
  annualReturn: number; // ex 0.07
  annualVol: number;    // ex 0.15
  monthlyContribution?: number;
  paths?: number;       // nb de trajectoires Monte Carlo
};

export default function Projections({ startValue, years, annualReturn, annualVol, monthlyContribution=0, paths=50 }: Props) {
  const months = Math.max(12, years*12);
  const mu = annualReturn/12;
  const sigma = annualVol/Math.sqrt(12);

  const sims = useMemo(() => {
    const arr: number[][] = [];
    for (let p=0;p<paths;p++){
      let v = startValue;
      const line:number[] = [v];
      for (let m=1;m<=months;m++){
        const z = boxMuller();
        v = Math.max(0, v * Math.exp((mu - 0.5*sigma*sigma) + sigma*z) + monthlyContribution);
        line.push(v);
      }
      arr.push(line);
    }
    return arr;
  }, [startValue, months, mu, sigma, monthlyContribution, paths]);

  const data = useMemo(() => {
    const out: any[] = [];
    for (let i=0;i<=months;i++){
      const row:any = { m: i };
      sims.forEach((s, idx) => row[`p${idx}`] = s[i]);
      out.push(row);
    }
    return out;
  }, [sims, months]);

  const p50 = (i:number) => percentile(sims.map(s=>s[i]), 50);
  const p10 = (i:number) => percentile(sims.map(s=>s[i]), 10);
  const p90 = (i:number) => percentile(sims.map(s=>s[i]), 90);
  const fan = data.map((d:any) => ({ m:d.m, p10:p10(d.m), p50:p50(d.m), p90:p90(d.m) }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={fan} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="p50" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopOpacity={0.4}/><stop offset="95%" stopOpacity={0.05}/></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="m" tickFormatter={(m)=>`${Math.round(Number(m)/12)}a`}/>
          <YAxis />
          <Tooltip formatter={(v:any)=>v.toFixed ? v.toFixed(0) : v}/>
          <Legend />
          <Area type="monotone" dataKey="p50" name="Médiane" fillOpacity={0.2} strokeOpacity={1} fill="url(#p50)" />
          <Area type="monotone" dataKey="p90" name="Optimiste (p90)" fillOpacity={0.1} strokeOpacity={0.6} />
          <Area type="monotone" dataKey="p10" name="Prudent (p10)" fillOpacity={0.1} strokeOpacity={0.6} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
function boxMuller(){ let u=0, v=0; while(u===0) u=Math.random(); while(v===0)v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
function percentile(a:number[], p:number){ const b=[...a].sort((x,y)=>x-y); const i=Math.floor((p/100)*(b.length-1)); return b[i]; }
