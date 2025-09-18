'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Factors } from '@/src/types/market';

export default function FactorsRadar({ f }: { f: Factors }) {
  const data = [
    { k: 'Momentum', v: f.momentum },
    { k: 'Value', v: f.value },
    { k: 'Quality', v: f.quality },
    { k: 'Risk', v: f.risk },
    { k: 'Growth', v: f.growth }
  ];
  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="k" />
          <PolarRadiusAxis angle={30} domain={[0,100]} />
          <Tooltip />
          <Radar dataKey="v" strokeWidth={2} fillOpacity={0.2}/>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
