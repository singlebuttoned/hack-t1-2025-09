import { z } from 'zod';

export const LogEntrySchema = z.object({
  '@timestamp': z.string(),
  '@level': z.enum(['trace', 'debug', 'info', 'warn', 'error']),
  '@message': z.string(),
  tf_run_id: z.string().optional(),
  provider: z.string().optional(),
  resource_type: z.string().optional(),
  resource_name: z.string().optional(),
  error: z.string().optional()
});

export type LogEntry = z.infer<typeof LogEntrySchema>;

export const SearchOptionsSchema = z.object({
  query: z.string().default('*'),
  timeRange: z
    .object({
      start: z.date(),
      end: z.date()
    })
    .nullable()
    .optional(),
  cursor: z.number().default(0),
  limit: z.number().default(20)
});

export type SearchOptions = z.infer<typeof SearchOptionsSchema>;
