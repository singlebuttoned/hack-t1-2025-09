'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useEdition } from '@/mfes/lib/edition-context';
import { listEditionConfigs } from '@/mfes/lib/mfe-helpers';

import type { PointerEvent as ReactPointerEvent } from 'react';

type DragState = {
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  hasDragged: boolean;
};

const INITIAL_POSITION = { x: 16, y: 16 };
const DRAG_THRESHOLD_PX = 3;

export function EditionSwitcher() {
  const { edition, setEdition } = useEdition();
  const editions = useMemo(() => listEditionConfigs(), []);
  const [position, setPosition] = useState(INITIAL_POSITION);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);

  const handleSuppressClick = useCallback((event: MouseEvent) => {
    if (!suppressClickRef.current) {
      window.removeEventListener('click', handleSuppressClick, true);
      return;
    }

    suppressClickRef.current = false;
    event.stopPropagation();
    event.preventDefault();
    window.removeEventListener('click', handleSuppressClick, true);
  }, []);

  const updatePosition = useCallback(
    (clientX: number, clientY: number, offsets: { x: number; y: number }) => {
      const node = containerRef.current;
      if (!node) {
        return;
      }

      const width = node.offsetWidth;
      const height = node.offsetHeight;
      const maxX = Math.max(0, window.innerWidth - width);
      const maxY = Math.max(0, window.innerHeight - height);

      const nextX = Math.min(Math.max(0, clientX - offsets.x), maxX);
      const nextY = Math.min(Math.max(0, clientY - offsets.y), maxY);

      setPosition({ x: nextX, y: nextY });
    },
    []
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state) {
        return;
      }

      const deltaX = Math.abs(event.clientX - state.startX);
      const deltaY = Math.abs(event.clientY - state.startY);

      if (!state.hasDragged) {
        if (deltaX < DRAG_THRESHOLD_PX && deltaY < DRAG_THRESHOLD_PX) {
          return;
        }

        state.hasDragged = true;
        suppressClickRef.current = true;
        window.addEventListener('click', handleSuppressClick, true);
      }

      event.preventDefault();
      updatePosition(event.clientX, event.clientY, {
        x: state.offsetX,
        y: state.offsetY
      });
    },
    [handleSuppressClick, updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    dragStateRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);

    if (!suppressClickRef.current) {
      window.removeEventListener('click', handleSuppressClick, true);
    }
  }, [handlePointerMove, handleSuppressClick]);

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('click', handleSuppressClick, true);
    };
  }, [handlePointerMove, handlePointerUp, handleSuppressClick]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if (event.button !== 0) {
        return;
      }

      const node = containerRef.current;
      if (!node) {
        return;
      }

      const rect = node.getBoundingClientRect();
      dragStateRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        hasDragged: false
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp]
  );

  const changeEdition = useCallback(
    (value: string) => {
      if (value === edition) {
        return;
      }

      const nextEdition = editions.find((item) => item.key === value);
      if (nextEdition === undefined) {
        return;
      }

      setEdition(nextEdition.key);
    },
    [edition, editions, setEdition]
  );

  const activeEdition = useMemo(
    () => editions.find((item) => item.key === edition),
    [edition, editions]
  );

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className='fixed top-0 left-0 z-50 touch-none select-none'
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='secondary' size='sm' className='shadow-lg'>
            Edition: {activeEdition ? activeEdition.label : 'Select '}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side='bottom' align='start' className='w-56'>
          <DropdownMenuLabel>Dev Edition Switcher</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={edition} onValueChange={changeEdition}>
            {editions.map((item) => (
              <DropdownMenuRadioItem key={item.key} value={item.key}>
                <div className='flex flex-col gap-1'>
                  <span className='font-medium'>{item.label}</span>
                  {item.description !== undefined ? (
                    <span className='text-muted-foreground text-xs'>
                      {item.description}
                    </span>
                  ) : null}
                </div>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
