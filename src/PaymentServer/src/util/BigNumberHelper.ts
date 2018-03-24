import { BigNumber } from "bignumber.js";

export class BigNumberHelper {

  static toBigNumber(val: number | string | BigNumber = 0): BigNumber {
    if (val instanceof BigNumber) {
      return val;
    }

    if (typeof val === "string" && (val.indexOf("0x") === 0 || val.indexOf("-0x") === 0)) {
      return new BigNumber(val.replace("0x", ""), 16);
    }

    return new BigNumber(val.toString(), 10);
  }

  static isBigNumber(object: any) {
    return object instanceof BigNumber;
  }
}

export { BigNumber };
