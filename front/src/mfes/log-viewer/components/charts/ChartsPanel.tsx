'use client';

import { ErrorDistributionChart } from './ErrorDistributionChart';
import { LogsOverTimeChart } from './LogsOverTimeChart';

export function ChartsPanel() {
  return (
    <div className='grid grid-cols-1 gap-4 border-t p-4 md:grid-cols-2'>
      <div>
        <h3 className='mb-2 text-lg font-semibold text-white'>
          Logs Over Time
        </h3>
        <LogsOverTimeChart />
      </div>
      <div>
        <h3 className='mb-2 text-lg font-semibold text-white'>
          Error Distribution
        </h3>
        <ErrorDistributionChart />
      </div>
    </div>
  );
}
