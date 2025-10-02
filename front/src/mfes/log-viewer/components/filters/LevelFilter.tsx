'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

import { useSearchStore } from '../../stores/useSearchStore';

export function LevelFilter() {
  const { fieldFilters, addFieldFilter, removeFieldFilter } = useSearchStore();
  const selectedLevels = fieldFilters['@level'] ?? [];

  const levels = ['trace', 'debug', 'info', 'warn', 'error'];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline'>
          Level {selectedLevels.length > 0 && `(${selectedLevels.length})`}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className='space-y-2'>
          {levels.map((level) => (
            <div key={level} className='flex items-center gap-2'>
              <Checkbox
                checked={selectedLevels.includes(level)}
                onCheckedChange={(checked: boolean) => {
                  if (checked) {
                    addFieldFilter('@level', level);
                  } else {
                    removeFieldFilter('@level', level);
                  }
                }}
              />
              <label>{level}</label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
