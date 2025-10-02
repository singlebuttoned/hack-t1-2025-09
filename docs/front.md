# Terraform LogViewer - Mock Frontend Implementation Plan

## Overview

This document outlines the implementation plan for the Terraform LogViewer mock frontend - a Kibana clone designed for hackathon demonstration. The frontend will use a mock NDJSON backend for rapid prototyping, with architecture designed for seamless migration to GraphQL + Elasticsearch.

### Goals

1. **Rapid MVP Development**: Working log viewer with search, filtering, and visualization in minimal time
2. **Demonstrate Core Features**: Show search, filtering, pagination, JSON expansion, and basic analytics
3. **Migration-Ready Architecture**: Design allows easy swap from mock backend to GraphQL without frontend changes
4. **Professional UX**: Kibana-like interface that impresses judges

### Tech Stack

**Core Framework**:
- React
- Next.js
- TypeScript

**State Management**:
- Zustand (atomic per-component stores + global feature stores)
- React Query (@tanstack/react-query)

**Validation**:
- Zod

**UI Components**:
- shadcn/ui
- shadcn/ui charts

**Search & Filtering**:
- `lucene-filter` - Parses and filters Lucene queries in-memory
- `lucene` - Query parsing for validation/transformation
- Lucene query syntax (direct Elasticsearch compatibility)

**Utilities**:
- `date-fns` - Date manipulation
- `react-datepicker` - Time range picker
- `react-json-view` - Expandable JSON viewer
- `use-debounce` - Search input debouncing

## Architecture

### High-Level Data Flow

```
graph TD
    A[User Input] -->|Query/Filters| B[SearchStore]
    B -->|Triggers| C[React Query]
    C -->|Fetches| D[Mock Backend<br/>lucene-filter]
    D -->|Reads| E[NDJSON File<br/>100 lines]
    D -->|Returns| F[Filtered Results]
    F -->|Updates| G[LogDataStore]
    G -->|Renders| H[UI Components]
    H -->|User Actions| I[Component Stores]
    I -->|Update State| H
```

### Store Architecture

```
graph LR
    subgraph "Global Feature Stores"
        A[SearchStore<br/>Query, Filters, TimeRange]
        B[LogDataStore<br/>Logs, Loading, Error]
        C[PaginationStore<br/>Cursor, HasMore]
    end
    
    subgraph "Component Stores"
        D[TimePickerStore<br/>UI State]
        E[FilterStore<br/>Dropdown State]
        F[LogEntryStore<br/>Expansion State]
        G[ChartStore<br/>Config State]
    end
    
    A -.-> B
    B -.-> C
```

### Component Hierarchy

```
graph TD
    Root[LogViewerPage]
    Root --> SearchBar[SearchBar]
    Root --> FilterBar[FilterBar]
    Root --> Stats[StatsBar]
    Root --> Viewer[LogViewer]
    Root --> Charts[ChartsPanel]
    
    SearchBar --> QueryInput[LuceneQueryInput]
    SearchBar --> ModeToggle[Simple/Advanced Toggle]
    
    FilterBar --> TimePicker[TimeRangePicker]
    FilterBar --> LevelFilter[LevelFilter]
    FilterBar --> PhaseFilter[PhaseFilter]
    FilterBar --> ActiveChips[ActiveFilterChips]
    
    Viewer --> LogList[LogList]
    Viewer --> Pagination[PaginationControls]
    
    LogList --> LogEntry[LogEntry x N]
    LogEntry --> JsonViewer[react-json-view]
    
    Charts --> LogsOverTime[LogsOverTimeChart]
    Charts --> ErrorDist[ErrorDistributionChart]
```

## File Structure

```
src/mfes/log-viewer/
├── page.tsx                          # Main log viewer page
├── components/
│   ├── search/
│   │   ├── SearchBar.tsx            # Main search interface
│   │   ├── LuceneQueryInput.tsx     # Query text input with syntax hints
│   │   └── QueryModeToggle.tsx      # Simple vs Advanced mode
│   ├── filters/
│   │   ├── FilterBar.tsx            # Container for all filters
│   │   ├── TimeRangePicker.tsx      # Date range picker
│   │   ├── LevelFilter.tsx          # Log level dropdown
│   │   ├── PhaseFilter.tsx          # Terraform phase filter
│   │   └── ActiveFilterChips.tsx    # Display active filters as chips
│   ├── logs/
│   │   ├── LogViewer.tsx            # Main log display container
│   │   ├── LogList.tsx              # List of log entries
│   │   ├── LogEntry.tsx             # Individual log entry component
│   │   ├── JsonViewer.tsx           # Wrapper for react-json-view
│   │   └── PaginationControls.tsx   # Next/Prev pagination
│   ├── charts/
│   │   ├── ChartsPanel.tsx          # Container for analytics
│   │   ├── LogsOverTimeChart.tsx    # Timeline chart (shadcn/ui)
│   │   └── ErrorDistributionChart.tsx # Pie/bar chart
│   └── stats/
│       └── StatsBar.tsx             # Quick stats display
├── stores/
│   ├── useSearchStore.ts            # Global: query, filters, time range
│   ├── useLogDataStore.ts           # Global: log entries, loading state
│   ├── usePaginationStore.ts       # Global: cursor, page navigation
│   ├── useTimePickerStore.ts       # Component: time picker UI state
│   ├── useFilterStore.ts           # Component: filter dropdown states
│   ├── useLogEntryStore.ts         # Component: expansion states per log ID
│   └── useChartStore.ts            # Component: chart configuration
├── hooks/
│   ├── useLogSearch.ts             # React Query hook for log search
│   └── useLogAggregations.ts       # React Query hook for chart data
├── mock-backend/
│   ├── index.ts                     # Main mock backend class
│   ├── search.ts                    # Search implementation with lucene-filter
│   ├── aggregations.ts             # Chart data aggregation logic
│   ├── data/
│   │   └── terraform-logs.ndjson    # 100 lines of sample logs
│   └── types.ts                     # TypeScript types and Zod schemas
└── types/
    └── index.ts                     # Shared types for log viewer
```

## Implementation Plan

### Phase 1: Core Infrastructure (2-3 hours)

**1.1 Mock Backend Setup**
- Load NDJSON file with 100 log lines
- Implement search using `lucene-filter`
- Basic cursor-based pagination
- Zod validation for inputs/outputs

```
// mock-backend/search.ts
import lucene from 'lucene-filter';
import { z } from 'zod';

export const SearchOptionsSchema = z.object({
  query: z.string().default('*'),
  timeRange: z.object({
    start: z.date(),
    end: z.date()
  }).optional(),
  cursor: z.number().default(0),
  limit: z.number().default(20)
});

export class MockSearchEngine {
  private logs: LogEntry[];
  
  search(options: z.infer<typeof SearchOptionsSchema>) {
    // Filter with lucene-filter
    const filterFn = options.query === '*' 
      ? () => true 
      : lucene(options.query);
    
    let results = this.logs.filter(filterFn);
    
    // Apply time range
    // Sort, paginate
    // Return with cursor
  }
}
```

**1.2 Zustand Stores**

Create all store files with initial state:

```
// stores/useSearchStore.ts
import { create } from 'zustand';

interface SearchStore {
  query: string;
  queryMode: 'simple' | 'advanced';
  timeRange: { start: Date; end: Date } | null;
  fieldFilters: Record<string, string[]>;
  
  setQuery: (q: string) => void;
  setQueryMode: (mode: 'simple' | 'advanced') => void;
  setTimeRange: (range: { start: Date; end: Date } | null) => void;
  addFieldFilter: (field: string, value: string) => void;
  removeFieldFilter: (field: string, value: string) => void;
  clearFilters: () => void;
  
  // Computed
  getSearchParams: () => SearchParams;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: '*',
  queryMode: 'simple',
  timeRange: null,
  fieldFilters: {},
  
  setQuery: (q) => set({ query: q }),
  setQueryMode: (mode) => set({ queryMode: mode }),
  setTimeRange: (range) => set({ timeRange: range }),
  
  addFieldFilter: (field, value) => set((state) => ({
    fieldFilters: {
      ...state.fieldFilters,
      [field]: [...(state.fieldFilters[field] || []), value]
    }
  })),
  
  removeFieldFilter: (field, value) => set((state) => ({
    fieldFilters: {
      ...state.fieldFilters,
      [field]: state.fieldFilters[field].filter(v => v !== value)
    }
  })),
  
  clearFilters: () => set({ fieldFilters: {}, timeRange: null, query: '*' }),
  
  getSearchParams: () => {
    const state = get();
    return {
      query: state.query,
      timeRange: state.timeRange,
      // Add field filters to query string
    };
  }
}));
```

**1.3 React Query Hooks**

```
// hooks/useLogSearch.ts
import { useQuery } from '@tanstack/react-query';
import { useSearchStore } from '@/stores/useSearchStore';
import { usePaginationStore } from '@/stores/usePaginationStore';
import { mockBackend } from '@/mock-backend';

export function useLogSearch() {
  const searchParams = useSearchStore(state => state.getSearchParams());
  const cursor = usePaginationStore(state => state.cursor);
  const limit = usePaginationStore(state => state.limit);
  
  return useQuery({
    queryKey: ['logs', searchParams, cursor, limit],
    queryFn: () => mockBackend.search({
      ...searchParams,
      cursor,
      limit
    }),
    keepPreviousData: true,
    staleTime: 0,
  });
}
```

### Phase 2: Search & Display (2-3 hours)

**2.1 Search Bar Component**

```
// components/search/SearchBar.tsx
import { useSearchStore } from '@/stores/useSearchStore';
import { useDebounce } from 'use-debounce';
import { useState, useEffect } from 'react';

export function SearchBar() {
  const { query, queryMode, setQuery, setQueryMode } = useSearchStore();
  const [localQuery, setLocalQuery] = useState(query);
  const [debouncedQuery] = useDebounce(localQuery, 300);
  
  useEffect(() => {
    setQuery(debouncedQuery);
  }, [debouncedQuery]);
  
  return (
    <div className="space-y-2">
      <QueryModeToggle mode={queryMode} onChange={setQueryMode} />
      <LuceneQueryInput 
        value={localQuery}
        onChange={setLocalQuery}
        mode={queryMode}
        placeholder={
          queryMode === 'simple' 
            ? 'error + timeout' 
            : '@level:error AND @message:timeout'
        }
      />
    </div>
  );
}
```

**2.2 Log Display Components**

```
// components/logs/LogEntry.tsx
import { useState } from 'react';
import ReactJson from 'react-json-view';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function LogEntry({ log }: { log: LogEntry }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border-b p-4 hover:bg-muted/50">
      <div className="flex items-start gap-3">
        <button onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronDown /> : <ChevronRight />}
        </button>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <LevelBadge level={log['@level']} />
            <span className="text-sm text-muted-foreground">
              {format(new Date(log['@timestamp']), 'HH:mm:ss.SSS')}
            </span>
            {log.tf_req_id && (
              <code className="text-xs bg-muted px-1 rounded">
                {log.tf_req_id.slice(0, 8)}
              </code>
            )}
          </div>
          
          <p className="text-sm">{log['@message']}</p>
          
          {expanded && (
            <div className="mt-2 bg-muted p-2 rounded">
              <ReactJson 
                src={log}
                theme="monokai"
                collapsed={1}
                displayDataTypes={false}
                enableClipboard
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

**2.3 Pagination**

```
// components/logs/PaginationControls.tsx
import { usePaginationStore } from '@/stores/usePaginationStore';
import { Button } from '@/components/ui/button';

export function PaginationControls({ 
  total, 
  nextCursor, 
  hasMore 
}: PaginationProps) {
  const { cursor, goNext, goPrevious, canGoPrevious } = usePaginationStore();
  
  return (
    <div className="flex items-center justify-between p-4 border-t">
      <span className="text-sm text-muted-foreground">
        Showing {cursor + 1}-{cursor + 20} of ~{total}
      </span>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={goPrevious}
          disabled={!canGoPrevious()}
        >
          Previous
        </Button>
        <Button 
          variant="outline"
          onClick={() => goNext(nextCursor)}
          disabled={!hasMore}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

### Phase 3: Filters & Time Range (1-2 hours)

**3.1 Time Range Picker**

```
// components/filters/TimeRangePicker.tsx
import DatePicker from 'react-datepicker';
import { useSearchStore } from '@/stores/useSearchStore';
import "react-datepicker/dist/react-datepicker.css";

export function TimeRangePicker() {
  const { timeRange, setTimeRange } = useSearchStore();
  
  const presets = [
    { label: 'Last 15 minutes', value: () => ({
      start: subMinutes(new Date(), 15),
      end: new Date()
    })},
    { label: 'Last 1 hour', value: () => ({
      start: subHours(new Date(), 1),
      end: new Date()
    })},
    { label: 'Last 24 hours', value: () => ({
      start: subDays(new Date(), 1),
      end: new Date()
    })},
  ];
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {timeRange 
            ? `${format(timeRange.start, 'PPp')} - ${format(timeRange.end, 'PPp')}`
            : 'Select time range'
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          {presets.map(preset => (
            <Button 
              key={preset.label}
              variant="ghost"
              onClick={() => setTimeRange(preset.value())}
            >
              {preset.label}
            </Button>
          ))}
          
          <div className="flex gap-2">
            <DatePicker
              selected={timeRange?.start}
              onChange={(date) => setTimeRange({ 
                ...timeRange!, 
                start: date 
              })}
              showTimeSelect
            />
            <DatePicker
              selected={timeRange?.end}
              onChange={(date) => setTimeRange({ 
                ...timeRange!, 
                end: date 
              })}
              showTimeSelect
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**3.2 Field Filters**

```
// components/filters/LevelFilter.tsx
import { useSearchStore } from '@/stores/useSearchStore';
import { Checkbox } from '@/components/ui/checkbox';

export function LevelFilter() {
  const { fieldFilters, addFieldFilter, removeFieldFilter } = useSearchStore();
  const selectedLevels = fieldFilters['@level'] || [];
  
  const levels = ['trace', 'debug', 'info', 'warn', 'error'];
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          Level {selectedLevels.length > 0 && `(${selectedLevels.length})`}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          {levels.map(level => (
            <div key={level} className="flex items-center gap-2">
              <Checkbox
                checked={selectedLevels.includes(level)}
                onCheckedChange={(checked) => {
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
```

### Phase 4: Charts & Analytics (1-2 hours)

**4.1 Aggregations in Mock Backend**

```
// mock-backend/aggregations.ts
export class MockAggregations {
  aggregateByLevel(logs: LogEntry[]) {
    const counts = logs.reduce((acc, log) => {
      const level = log['@level'];
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([level, count]) => ({
      level,
      count
    }));
  }
  
  aggregateOverTime(logs: LogEntry[], bucketMinutes = 5) {
    // Group logs into time buckets
    const buckets = new Map<string, number>();
    
    logs.forEach(log => {
      const timestamp = new Date(log['@timestamp']);
      const bucketKey = format(
        startOfMinute(timestamp), 
        'HH:mm'
      );
      buckets.set(bucketKey, (buckets.get(bucketKey) || 0) + 1);
    });
    
    return Array.from(buckets.entries()).map(([time, count]) => ({
      time,
      count
    }));
  }
}
```

**4.2 Charts with shadcn/ui**

```
// components/charts/ErrorDistributionChart.tsx
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useLogAggregations } from '@/hooks/useLogAggregations';

const chartConfig = {
  count: {
    label: "Log Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ErrorDistributionChart() {
  const { data, isLoading } = useLogAggregations('level');
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <BarChart data={data}>
        <XAxis dataKey="level" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" />
      </BarChart>
    </ChartContainer>
  );
}
```

```
// components/charts/LogsOverTimeChart.tsx
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Logs per minute",
    color: "hsl(var(--chart-2))",
  },
};

export function LogsOverTimeChart() {
  const { data, isLoading } = useLogAggregations('time');
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <AreaChart data={data}>
        <XAxis dataKey="time" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area 
          dataKey="count" 
          fill="var(--color-count)" 
          stroke="var(--color-count)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
```

## Key Implementation Rules

### 1. Store Usage Rules

**DO**:
- Use Zustand stores for ALL component state (no useState for business logic)
- Create atomic stores per complex component
- Use global stores for cross-component data (search params, log data)
- Keep stores simple and focused

**DON'T**:
- Don't use useState for searchQuery, filters, pagination state
- Don't prop-drill state through multiple components
- Don't mix React Query state with Zustand state

### 2. React Query Rules

**DO**:
- Use React Query ONLY for data fetching
- Pass search params via queryKey for automatic refetching
- Use `keepPreviousData: true` for smooth pagination
- Set `staleTime: 0` for log data (always fresh)

**DON'T**:
- Don't use React Query state as application state
- Don't manually trigger refetches (use queryKey changes)

### 3. Lucene Query Rules

**DO**:
- Accept raw Lucene query strings everywhere
- Use `lucene-filter` for filtering in mock backend
- Support both simple (`error + timeout`) and advanced (`@level:error AND @message:timeout`) syntax
- Show generated queries to users

**DON'T**:
- Don't parse Lucene queries manually
- Don't convert to different query format
- Don't validate syntax (let lucene-filter handle it)

### 4. Code Style Rules

**TypeScript**:
- All files must be `.tsx` or `.ts`
- Use Zod schemas for all API boundaries
- Define types in dedicated `types/` files
- Use `satisfies` for type checking

**Components**:
- One component per file
- Use shadcn/ui components for all UI elements
- Keep components under 200 lines
- Extract logic to custom hooks or stores if needed

**Naming**:
- Components: PascalCase (`LogEntry.tsx`)
- Stores: `use` prefix (`useSearchStore.ts`)
- Hooks: `use` prefix (`useLogSearch.ts`)
- Types: PascalCase with descriptive names

### 5. Performance Rules

**DO**:
- Debounce search input (300ms)
- Use cursor-based pagination
- Memoize expensive computations
- Lazy load chart data

**DON'T**:
- Don't render all 100 logs at once
- Don't recalculate aggregations on every render
- Don't make new API calls for cached data

## Migration Path to GraphQL

The architecture is designed for zero-frontend-changes migration:

### Current (Mock)

```
const { data } = useQuery({
  queryKey: ['logs', params],
  queryFn: () => mockBackend.search(params)
});
```

### Future (GraphQL)

```
const { data } = useQuery({
  queryKey: ['logs', params],
  queryFn: () => graphqlClient.query({
    query: SEARCH_LOGS_QUERY,
    variables: params
  })
});
```

**What stays the same**:
- All Zustand stores (unchanged)
- All components (unchanged)
- All Lucene query syntax (passed directly to backend)
- All UI logic (unchanged)

**What changes**:
- Only the `queryFn` in React Query hooks
- Mock backend replaced with Apollo Client calls

## Development Workflow

### 1. Setup (15 minutes)

```
cd src/mfes/log-viewer
npm install lucene lucene-filter date-fns react-datepicker react-json-view use-debounce
npx shadcn@latest add chart
```

### 2. Create Mock Data (15 minutes)

- Copy 100 lines from provided NDJSON
- Place in `mock-backend/data/terraform-logs.ndjson`

### 3. Build Bottom-Up (4-5 hours)

1. Mock backend + stores (1 hour)
2. Search bar + log display (1.5 hours)
3. Filters + pagination (1 hour)
4. Charts + polish (1.5 hours)

### 4. Testing Checklist

- [ ] Search with simple syntax works
- [ ] Search with advanced Lucene syntax works
- [ ] Time range filter works
- [ ] Field filters (level, phase) work
- [ ] Pagination works (next/previous)
- [ ] Log expansion shows JSON
- [ ] Charts display correct data
- [ ] Debouncing prevents excessive queries
- [ ] Loading states show correctly
- [ ] Error states handled gracefully

## Demo Script

1. **Show search**: Type `error + timeout` → instant results
2. **Show advanced search**: Switch to advanced, type `@level:error AND @message:timeout`
3. **Show filters**: Apply level filter (error), time range (last 1 hour)
4. **Show pagination**: Navigate through results
5. **Show JSON expansion**: Click log entry, expand tf_http_req_body
6. **Show charts**: Display error distribution, logs over time
7. **Show query copy**: Copy generated Lucene query for curl usage

## Success Metrics

- **Setup time**: < 30 minutes from clone to running
- **Search latency**: < 100ms for 100 logs
- **Code quality**: TypeScript strict mode, zero warnings
- **UX polish**: Smooth transitions, loading states, error handling
- **Demo readiness**: Can show all features in 3-minute demo

---

**Remember**: The goal is a working, impressive demo. Prioritize features that judges will see. Polish beats features. Ship fast, iterate later.
