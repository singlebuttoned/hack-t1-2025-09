import { startOfMinute, format } from 'date-fns';

import { LogEntry } from './types';

export class MockAggregations {
  aggregateByLevel(logs: LogEntry[]) {
    const counts = logs.reduce((acc: Record<string, number>, log) => {
      const level = log['@level'];
      acc[level] = (acc[level] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([level, count]) => ({
      level,
      count
    }));
  }

  aggregateOverTime(logs: LogEntry[], bucketMinutes = 5) {
    const buckets = new Map<string, number>();

    logs.forEach((log) => {
      const timestamp = new Date(log['@timestamp']);
      const bucketKey = format(
        startOfMinute(
          new Date(
            Math.floor(timestamp.getTime() / (bucketMinutes * 60 * 1000)) *
              (bucketMinutes * 60 * 1000)
          )
        ),
        'HH:mm'
      );
      buckets.set(bucketKey, (buckets.get(bucketKey) ?? 0) + 1);
    });

    return Array.from(buckets.entries()).map(([time, count]) => ({
      time,
      count
    }));
  }
}
