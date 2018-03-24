import { rootReducer } from "./reducers";
import { DetailsMode } from "./Details/DetailsReducers";

describe("root reducer", () => {
  it("provides an initial state", () => {
    const newState = rootReducer({}, {type: ""});
    expect(newState).toEqual({
      details: {
        mode: DetailsMode.Nothing,
        selectedBlock: undefined,
        selectedAddress: undefined,
      },
      list: {
        blocks: [],
        latestBlockNr: 0,
        oldestBlockNr: 0,
        isLoadingBlocks: false,
        addresses: []
      }
    });
  });
});
