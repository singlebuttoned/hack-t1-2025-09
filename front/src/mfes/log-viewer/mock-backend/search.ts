import lucene from 'lucene-filter';
import { z } from 'zod';

import { terraformLogsNdjson } from './data/terraform-logs';
import { SearchOptionsSchema, LogEntry, LogEntrySchema } from './types';

export class MockSearchEngine {
  private logs: LogEntry[];

  constructor() {
    this.logs = terraformLogsNdjson
      .trim()
      .split('\n')
      .map((line: string) => {
        try {
          return LogEntrySchema.parse(JSON.parse(line));
        } catch (_e) {
          return null;
        }
      })
      .filter((x: LogEntry | null): x is LogEntry => x !== null);
  }

  search(options: z.infer<typeof SearchOptionsSchema>) {
    const validatedOptions = SearchOptionsSchema.parse(options);
    const { query, timeRange, cursor, limit } = validatedOptions;

    const filterFn =
      query === '*'
        ? () => true
        : (lucene as (query: string) => (log: LogEntry) => boolean)(query);

    let results = this.logs.filter((log) => Boolean(filterFn(log)));

    if (timeRange) {
      results = results.filter((log) => {
        const timestamp = new Date(log['@timestamp']);
        return timestamp >= timeRange.start && timestamp <= timeRange.end;
      });
    }

    results.sort(
      (a, b) =>
        new Date(b['@timestamp']).getTime() -
        new Date(a['@timestamp']).getTime()
    );

    const paginatedResults = results.slice(cursor, cursor + limit);

    return {
      logs: paginatedResults,
      total: results.length,
      nextCursor: cursor + limit < results.length ? cursor + limit : null
    };
  }
}
