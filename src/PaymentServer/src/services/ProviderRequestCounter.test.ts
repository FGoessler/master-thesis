import { ProviderRequestCounter } from "./ProviderRequestCounter";

describe("FundingService", () => {

  function toState(counter: ProviderRequestCounter) {
    return [
      counter.lowestCompletedCount,
      counter.highestCount,
      counter.missingCountsInBetween
    ];
  }

  test("JSON serialization", () => {
    const origCounter = new ProviderRequestCounter();
    origCounter.registerCount(5);
    origCounter.signature = "dfdfaefae";
    const json = origCounter.toJSONObj();

    const recreatedCounter = ProviderRequestCounter.fromJSONObj(json);

    expect(recreatedCounter).toEqual(origCounter);
    expect(toState(recreatedCounter)).toEqual(toState(origCounter));
  });

  test("register count keeps track of missing numbers below the highest", () => {
    const counter = new ProviderRequestCounter();
    expect(toState(counter)).toEqual([0, 0, []]);
    counter.registerCount(1);
    expect(toState(counter)).toEqual([1, 1, []]);
    counter.registerCount(5);
    expect(toState(counter)).toEqual([1, 5, [2, 3, 4]]);
    counter.registerCount(2);
    expect(toState(counter)).toEqual([2, 5, [3, 4]]);
    counter.registerCount(10);
    expect(toState(counter)).toEqual([2, 10, [3, 4, 6, 7, 8, 9]]);
    counter.registerCount(7);
    counter.registerCount(8);
    expect(toState(counter)).toEqual([2, 10, [3, 4, 6, 9]]);
    counter.registerCount(4);
    expect(toState(counter)).toEqual([2, 10, [3, 6, 9]]);
    counter.registerCount(3);
    expect(toState(counter)).toEqual([5, 10, [6, 9]]);
    counter.registerCount(11);
    expect(toState(counter)).toEqual([5, 11, [6, 9]]);
  });

  test("is count valid", () => {
    const counter = new ProviderRequestCounter();
    expect(toState(counter)).toEqual([0, 0, []]);

    expect(counter.isCountValid(1)).toBe(true);
    expect(counter.isCountValid(2)).toBe(true);
    expect(counter.isCountValid(0)).toBe(false);

    counter.registerCount(1);
    counter.registerCount(5);
    counter.registerCount(2);
    counter.registerCount(10);
    expect(toState(counter)).toEqual([2, 10, [3, 4, 6, 7, 8, 9]]);

    expect(counter.isCountValid(3)).toBe(true);
    expect(counter.isCountValid(4)).toBe(true);
    expect(counter.isCountValid(6)).toBe(true);
    expect(counter.isCountValid(7)).toBe(true);
    expect(counter.isCountValid(8)).toBe(true);
    expect(counter.isCountValid(9)).toBe(true);
    expect(counter.isCountValid(11)).toBe(true);
    expect(counter.isCountValid(15)).toBe(true);

    expect(counter.isCountValid(-3)).toBe(false);
    expect(counter.isCountValid(0)).toBe(false);
    expect(counter.isCountValid(1)).toBe(false);
    expect(counter.isCountValid(2)).toBe(false);
    expect(counter.isCountValid(5)).toBe(false);
    expect(counter.isCountValid(10)).toBe(false);
  });

  test("list of numbers between two numbers generation", () => {
    expect(ProviderRequestCounter.listOfNumsBetween(0, 1)).toEqual([]);
    expect(ProviderRequestCounter.listOfNumsBetween(2, 4)).toEqual([3]);
    expect(ProviderRequestCounter.listOfNumsBetween(5, 8)).toEqual([6, 7]);
    expect(ProviderRequestCounter.listOfNumsBetween(0, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

});


