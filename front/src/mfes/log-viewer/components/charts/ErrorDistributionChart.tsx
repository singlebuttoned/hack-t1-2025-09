'use client';

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import { useLogAggregations } from '../../hooks/useLogAggregations';

export function ErrorDistributionChart() {
  const { data, isLoading } = useLogAggregations('level');

  if (isLoading) return <div>Loading...</div>;

  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data}>
        <XAxis dataKey='level' />
        <YAxis />
        <Tooltip />
        <Bar dataKey='count' fill='#8884d8' />
      </BarChart>
    </ResponsiveContainer>
  );
}
