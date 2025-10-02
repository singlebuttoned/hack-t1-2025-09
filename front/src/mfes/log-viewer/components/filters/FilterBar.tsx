'use client';

import { LevelFilter } from './LevelFilter';
import { TimeRangePicker } from './TimeRangePicker';

export function FilterBar() {
  return (
    <div className='flex items-center gap-4 border-b p-4'>
      <TimeRangePicker />
      <LevelFilter />
    </div>
  );
}
