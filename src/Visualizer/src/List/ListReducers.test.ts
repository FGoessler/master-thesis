import { loadedBlocks, loadingBlocks } from "../Actions/LoadBlocks";
import {
  addAddressReducer, blocksReducer, isLoadingReducer, latestBlockReducer,
  oldestBlockReducer
} from "./ListReducers";
import { MockBlock } from "../Util/MockBlockchain";
import { addAddress } from "../Actions/AddAddress";

describe("blocks reducer", () => {
  it("handles the LoadedBlocks action", () => {
    const blocks = [new MockBlock(1), new MockBlock(2)];
    const newState = blocksReducer([], loadedBlocks(blocks, 1, 0));
    expect(newState).toEqual(blocks);
  });
});

describe("latest block nr reducer", () => {
  it("handles the LoadedBlocks action", () => {
    const blocks = [new MockBlock(1), new MockBlock(2)];
    const newState = latestBlockReducer(undefined, loadedBlocks(blocks, 2, 1));
    expect(newState).toEqual(2);
  });
});

describe("oldest block nr reducer", () => {
  it("handles the LoadedBlocks action", () => {
    const blocks = [new MockBlock(1), new MockBlock(2)];
    const newState = oldestBlockReducer(undefined, loadedBlocks(blocks, 2, 1));
    expect(newState).toEqual(1);
  });
});

describe("is loading blocks reducer", () => {
  it("handles the LoadedBlocks action", () => {
    const newState = isLoadingReducer(false, loadingBlocks(true));
    expect(newState).toEqual(true);
  });
});

describe("add address reducer", () => {
  it("adds the new address to teh list of addresses", () => {
    const oldList = ["0x1234"];
    const newState = addAddressReducer(oldList, addAddress("0xabcd"));
    expect(newState).toEqual(["0x1234", "0xabcd"]);
  });
});
