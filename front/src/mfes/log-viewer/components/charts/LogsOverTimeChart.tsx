'use client';

import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import { useLogAggregations } from '../../hooks/useLogAggregations';

export function LogsOverTimeChart() {
  const { data, isLoading } = useLogAggregations('time');

  if (isLoading) return <div>Loading...</div>;

  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={data}>
        <XAxis dataKey='time' />
        <YAxis />
        <Tooltip />
        <Area type='monotone' dataKey='count' stroke='#8884d8' fill='#8884d8' />
      </AreaChart>
    </ResponsiveContainer>
  );
}
