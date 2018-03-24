import BlockListService from "../BlockInspector/BlockListService";
import MockWeb3, { MockTransaction } from "../Util/MockBlockchain";
import { loadedSelectedBlock, loadingSelectedBlock, selectBlock } from "./LoadBlock";

describe("select block", () => {
  it("dispatches a loaded selected blocks action on success", async () => {
    const fakeDispatch = jest.fn();
    const fakeBlockListService = new BlockListService(new MockWeb3());

    await selectBlock("0x2a")(fakeDispatch, {}, {blockListService: fakeBlockListService});

    expect(fakeDispatch).toHaveBeenCalledWith(loadingSelectedBlock());
    const transaction = new MockTransaction();
    transaction.transactionReceipt = {
      blockHash: "0x2a",
      blockNumber: 1,
      transactionHash: "0xffff1a",
      gasUsed: 100000,
      logs: []
    };
    expect(fakeDispatch).toHaveBeenCalledWith(loadedSelectedBlock({
      number: 1,
      hash: "0x2a",
      parentHash: "0x1a",
      timestamp: 100000,
      transactions: [transaction]
    }));
  });
});
