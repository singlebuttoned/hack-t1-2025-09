'use client';

import { format, subDays, subHours, subMinutes } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

import { useSearchStore } from '../../stores/useSearchStore';

export function TimeRangePicker() {
  const { timeRange, setTimeRange } = useSearchStore();

  const presets = [
    {
      label: 'Last 15 minutes',
      value: () => ({
        start: subMinutes(new Date(), 15),
        end: new Date()
      })
    },
    {
      label: 'Last 1 hour',
      value: () => ({
        start: subHours(new Date(), 1),
        end: new Date()
      })
    },
    {
      label: 'Last 24 hours',
      value: () => ({
        start: subDays(new Date(), 1),
        end: new Date()
      })
    }
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline'>
          {timeRange
            ? `${format(timeRange.start, 'PPp')} - ${format(timeRange.end, 'PPp')}`
            : 'Select time range'}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className='space-y-2'>
          {presets.map((preset) => (
            <Button
              key={preset.label}
              variant='ghost'
              onClick={() => setTimeRange(preset.value())}
            >
              {preset.label}
            </Button>
          ))}

          <div className='flex gap-2'>
            <DatePicker
              selected={timeRange?.start ?? null}
              onChange={(date) =>
                setTimeRange({
                  start: date as Date,
                  end: timeRange?.end ?? new Date()
                })
              }
              showTimeSelect
              className='w-full'
            />
            <DatePicker
              selected={timeRange?.end ?? null}
              onChange={(date) =>
                setTimeRange({
                  start: timeRange?.start ?? new Date(),
                  end: date as Date
                })
              }
              showTimeSelect
              className='w-full'
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
