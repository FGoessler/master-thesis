import BlockListService from "../BlockInspector/BlockListService";
import MockWeb3, { MockEth } from "../Util/MockBlockchain";
import { loadBlocks, loadedBlocks, loadingBlocks } from "./LoadBlocks";

describe("load blocks", () => {
  let fakeDispatch: () => void;
  let fakeBlockListService: BlockListService;
  let mockWeb3: MockWeb3;

  beforeEach(() => {
    fakeDispatch = jest.fn();
    mockWeb3 = new MockWeb3();
    fakeBlockListService = new BlockListService(mockWeb3);
  });

  it("dispatches a loaded blocks action on success", async () => {
    await loadBlocks()(fakeDispatch, {}, {blockListService: fakeBlockListService});

    expect(fakeDispatch).toHaveBeenCalledWith(loadedBlocks([(<MockEth> mockWeb3.eth).blocks[1]], 2, 0));
    expect(fakeDispatch).toHaveBeenCalledWith(loadingBlocks(false));
  });

  it("dispatches a loading blocks action on start", async () => {
    loadBlocks()(fakeDispatch, {}, {blockListService: fakeBlockListService});

    expect(fakeDispatch).toHaveBeenCalledWith(loadingBlocks(true));
  });
});
