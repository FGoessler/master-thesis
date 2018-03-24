import { InvalidRequestCountError } from "../errors";

export class ProviderRequestCounter {
  lowestCompletedCount: number = 0;
  highestCount: number = 0;
  missingCountsInBetween: number[] = [];
  knownSince: number = Date.now() / 1000;
  signature?: string = undefined;

  static fromJSONObj(obj: any) {
    const c = new ProviderRequestCounter();
    if (!!obj) {
      c.lowestCompletedCount = obj.lowestCompletedCount || c.lowestCompletedCount;
      c.highestCount = obj.highestCount || c.highestCount;
      c.missingCountsInBetween = obj.missingCountsInBetween || c.missingCountsInBetween;
      c.knownSince = obj.knownSince || c.knownSince;
      c.signature = obj.signature || c.signature;
    }
    return c;
  }

  toJSONObj() {
    return {
      lowestCompletedCount: this.lowestCompletedCount,
      highestCount: this.highestCount,
      missingCountsInBetween: this.missingCountsInBetween,
      knownSince: this.knownSince,
      signature: this.signature
    };
  }

  isCountValid(count: number): boolean {
    if (this.lowestCompletedCount === this.highestCount) {
      if (this.highestCount + 1 <= count) {
        return true;
      } else {
        return false;
      }
    } else {
      if (this.missingCountsInBetween.indexOf(count) !== -1) {
        return true;
      } else {
        return this.highestCount + 1 <= count;
      }
    }
  }

  registerCount(count: number) {
    if (this.lowestCompletedCount === this.highestCount) {
      if (this.lowestCompletedCount + 1 === count) {
        this.lowestCompletedCount += 1;
        this.highestCount += 1;
      } else if (this.lowestCompletedCount + 1 < count) {
        this.highestCount = count;
        const items = ProviderRequestCounter.listOfNumsBetween(this.lowestCompletedCount, this.highestCount);
        this.missingCountsInBetween = this.missingCountsInBetween.concat(items);
      } else {
        throw new InvalidRequestCountError(this.highestCount);
      }
    } else {
      const idx = this.missingCountsInBetween.indexOf(count);
      if (idx !== -1) {
        this.missingCountsInBetween.splice(idx, 1);
        if (idx === 0) {
          if (this.missingCountsInBetween.length === 0) {
            this.lowestCompletedCount = this.highestCount;
          } else {
            this.lowestCompletedCount = this.missingCountsInBetween[0] - 1;
          }
        }
      } else if (this.highestCount + 1 === count) {
        this.highestCount = count;
      } else if (this.highestCount + 1 < count) {
        const items = ProviderRequestCounter.listOfNumsBetween(this.highestCount, count);
        this.missingCountsInBetween = this.missingCountsInBetween.concat(items);
        this.highestCount = count;
      } else {
        throw new InvalidRequestCountError(this.highestCount);
      }

      if (this.missingCountsInBetween.length === 0) {
        this.lowestCompletedCount = this.highestCount;
      }
    }
  }

  static listOfNumsBetween(start: number, end: number): number[] {
    const diff = end - start;
    const nums = [];
    for (let i = 1; i < diff; i++) {
      nums.push(start + i);
    }
    return nums;
  }
}
