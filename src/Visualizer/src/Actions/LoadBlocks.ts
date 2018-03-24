import { Block, isTransaction } from "../Util/web3";
import BlockListService from "../BlockInspector/BlockListService";
import { Action, Dispatch } from "redux";
import { addAddress } from "./AddAddress";

export interface LoadingBlocks extends Action {
  type: string;
  loading: boolean;
}

export function isLoadingBlocks(action: Action): action is LoadingBlocks {
  return action.type === "LoadingBlocks";
}

export const loadingBlocks = (loading: boolean): LoadingBlocks => {
  return {
    type: "LoadingBlocks",
    loading: loading
  };
};

export interface LoadedBlocks extends Action {
  type: string;
  blocks: Block[];
  latestBlockNr: number;
  oldestBlockNr: number;
}

export function isLoadedBlocks(action: Action): action is LoadedBlocks {
  return action.type === "LoadedBlocks";
}

export const loadedBlocks = (blocks: Block[], latestBlockNr: number, oldestBlockNr: number): LoadedBlocks => {
  return {
    type: "LoadedBlocks", blocks, latestBlockNr, oldestBlockNr
  };
};

export function loadBlocks(startingBlockNr?: number) {
  return function (dispatch: Dispatch<{}>, _: {}, dependencies: {blockListService: BlockListService}) {

    dispatch(loadingBlocks(true));

    const addAllAddressesInTransactionsOfBlocks = (blocks: Block[]) => {
      blocks.forEach((block) => {
        block.transactions.forEach((transaction) => {
          if (isTransaction(transaction)) {
            dispatch(addAddress(transaction.from));
            if (transaction.to) {
              dispatch(addAddress(transaction.to));
            }
          }
        });
      });
    };
    const onlyBlocksWithTransactionsFilter = (block: Block) => {
      return block.transactions.length > 0;
    };
    const dispatchFilteredLoadedBlocks = (blocks: Block[]) => {
      const filteredBlocks = blocks.filter(onlyBlocksWithTransactionsFilter);
      dispatch(loadedBlocks(
        filteredBlocks,
        blocks.length > 0 ? blocks[0].number : 0,
        blocks.length > 0 ? blocks[blocks.length - 1].number : 0
      ));
      addAllAddressesInTransactionsOfBlocks(filteredBlocks);
    };

    let loadingPromise;
    if (typeof startingBlockNr === "number") {
      loadingPromise = dependencies.blockListService
        .getBlocksStartingWith(startingBlockNr, 3000, dispatchFilteredLoadedBlocks);
    } else {
      loadingPromise = dependencies.blockListService
        .getBlocksStartingWithLatest(3000, dispatchFilteredLoadedBlocks);
    }

    return loadingPromise.then(() => dispatch(loadingBlocks(false)));
  };
}
