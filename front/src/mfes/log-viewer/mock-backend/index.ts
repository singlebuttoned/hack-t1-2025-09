import { MockAggregations } from './aggregations';
import { MockSearchEngine } from './search';
import { SearchOptions } from './types';

class MockBackend {
  public searchEngine: MockSearchEngine;
  public aggregations: MockAggregations;

  constructor() {
    this.searchEngine = new MockSearchEngine();
    this.aggregations = new MockAggregations();
  }

  search(options: SearchOptions) {
    return this.searchEngine.search(options);
  }

  getAggregations(options: SearchOptions, aggregation: 'level' | 'time') {
    const results = this.searchEngine.search(options);
    if (aggregation === 'level') {
      return this.aggregations.aggregateByLevel(results.logs);
    }
    return this.aggregations.aggregateOverTime(results.logs);
  }
}

export const mockBackend = new MockBackend();
