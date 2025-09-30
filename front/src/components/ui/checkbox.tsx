'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      className={cn(
        // Base styles matching Figma design
        'peer shrink-0 rounded-md border-[1.25px] transition-all outline-none',
        // Size: 30px x 30px (larger to match Figma)
        'size-[30px]',
        // Default state: background with border
        'border-border bg-input',
        // Checked state: accent background with accent border
        'data-[state=checked]:border-accent data-[state=checked]:bg-accent',
        // Text color for check icon
        'data-[state=checked]:text-accent-foreground',
        // Focus styles
        'focus-visible:ring-accent/50 focus-visible:ring-2 focus-visible:ring-offset-2',
        // Disabled styles
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Invalid styles
        'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot='checkbox-indicator'
        className='flex items-center justify-center text-current transition-none'
      >
        <CheckIcon className='size-4 stroke-[2px]' />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
