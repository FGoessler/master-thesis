
interface CacheItem {
  data: any;
  validUntil: number | undefined;
  optimisticCacheRefreshThreshold: number | undefined;
  optimisticCacheRefreshRunning: boolean;
}

export class TimeLimitedCache {

  private cacheData: { [key: string]: CacheItem } = {};

  public getItem(key: string): CacheItem | undefined {
    const item = this.cacheData[key];
    if (item && (item.validUntil === undefined || item.validUntil >= Date.now())) {
      return item;
    } else {
      return undefined;
    }
  }

  public putItem(key: string, item: any, validFor: number | undefined = undefined) {
    this.cacheData[key] = {
      data: item,
      validUntil: validFor ? Date.now() + validFor : undefined,
      optimisticCacheRefreshThreshold: validFor ? 5000 : undefined,
      optimisticCacheRefreshRunning: false
    };
  }

  public async getValueWithOptimisticUpdates<T>(id: string, valueFetcher: () => Promise<T>, cacheDurationCalculator?: () => Promise<number>): Promise<T> {
    const cacheEntry = this.getItem(id);
    if (cacheEntry) {
      if (cacheEntry.validUntil && cacheEntry.optimisticCacheRefreshThreshold && !cacheEntry.optimisticCacheRefreshRunning &&
        cacheEntry.validUntil - cacheEntry.optimisticCacheRefreshThreshold <= Date.now()) {
        cacheEntry.optimisticCacheRefreshRunning = true;
        try {
          await this.fetchValue(id, valueFetcher, cacheDurationCalculator);
          cacheEntry.optimisticCacheRefreshRunning = false;
        } catch (e) {
          cacheEntry.optimisticCacheRefreshRunning = false;
        }
      }
      return cacheEntry.data;
    } else {
      return this.fetchValue(id, valueFetcher, cacheDurationCalculator);
    }
  }

  private async fetchValue<T>(id: string, valueFetcher: () => Promise<T>, cacheDurationCalculator?: () => Promise<number>) {
    const value = await valueFetcher();
    let cachingDuration = undefined;
    if (typeof cacheDurationCalculator === "function") {
      cachingDuration = await cacheDurationCalculator();
    }
    this.putItem(id, value, cachingDuration);
    return value;
  }

}
