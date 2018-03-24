const BigNumberLib = require("bignumber.js");

const unitMap = {
  "wei":          "1",
  "kwei":         "1000",
  "ada":          "1000",
  "femtoether":   "1000",
  "mwei":         "1000000",
  "babbage":      "1000000",
  "picoether":    "1000000",
  "gwei":         "1000000000",
  "shannon":      "1000000000",
  "nanoether":    "1000000000",
  "nano":         "1000000000",
  "szabo":        "1000000000000",
  "microether":   "1000000000000",
  "micro":        "1000000000000",
  "finney":       "1000000000000000",
  "milliether":   "1000000000000000",
  "milli":        "1000000000000000",
  "ether":        "1000000000000000000",
  "kether":       "1000000000000000000000",
  "grand":        "1000000000000000000000",
  "einstein":     "1000000000000000000000",
  "mether":       "1000000000000000000000000",
  "gether":       "1000000000000000000000000000",
  "tether":       "1000000000000000000000000000000"
};

export interface BigNumber {
  toNumber(): number;
  toString(base: number): string;
  times(num: number | BigNumber): BigNumber;
  dividedBy(num: number | BigNumber): BigNumber;
}

export class BigNumberHelper {

  static toBigNumber(val: number | string | BigNumber = 0): BigNumber {
    if (val instanceof BigNumberLib) {
      return val as BigNumber;
    }

    if (typeof val === "string" && (val.indexOf("0x") === 0 || val.indexOf("-0x") === 0)) {
      return new BigNumberLib(val.replace("0x", ""), 16);
    }

    return new BigNumberLib((<number> val).toString(), 10);
  }

  static isBigNumber(object: {}) {
    return object instanceof BigNumberLib;
  }

  static toWei(num: number | string | BigNumber, unit: string) {
    return BigNumberHelper.toBigNumber(num).times(BigNumberHelper.getValueOfUnit(unit));
  }

  static fromWei(num: number | string | BigNumber, unit: string) {
    return BigNumberHelper.toBigNumber(num).dividedBy(BigNumberHelper.getValueOfUnit(unit));
  }

  private static getValueOfUnit(unit: string) {
    unit = unit ? unit.toLowerCase() : "ether";
    let unitValue = unitMap[unit];
    if (!unitValue) {
      throw new Error("Unit does not exist. Possible units: " + JSON.stringify(unitMap));
    }
    return new BigNumberLib(unitValue, 10);
  }
}
