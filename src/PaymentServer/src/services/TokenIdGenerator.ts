import { BigNumber, BigNumberHelper } from "../util/BigNumberHelper";
const uuid = require("uuid/v4");

export default class TokenIdGenerator {

  createRandomTokenId(): BigNumber {
    const buffer = Buffer.alloc(32);
    uuid(undefined, buffer, 0);
    uuid(undefined, buffer, 16);
    return BigNumberHelper.toBigNumber("0x" + buffer.toString("hex").replace(/-/g, ""));
  }

}
