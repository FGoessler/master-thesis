import { Block } from "../Util/web3";
import BlockListService from "../BlockInspector/BlockListService";
import { Action, Dispatch } from "redux";

export interface LoadingSelectedBlock extends Action {
  type: string;
}

export function isLoadingSelectedBlock(action: Action): action is LoadingSelectedBlock {
  return action.type === "LoadingSelectedBlock";
}

export const loadingSelectedBlock = (): LoadingSelectedBlock => {
  return {
    type: "LoadingSelectedBlock"
  };
};

export interface LoadedSelectedBlock extends Action {
  type: string;
  block: Block;
}

export function isLoadedSelectedBlock(action: Action): action is LoadedSelectedBlock {
  return action.type === "LoadedSelectedBlock";
}

export const loadedSelectedBlock = (block: Block): LoadedSelectedBlock => {
  return {
    type: "LoadedSelectedBlock",
    block: block
  };
};

export const selectBlock = (blockHash: string) => {
  return async function (dispatch: Dispatch<{}>, _: {}, dependencies: { blockListService: BlockListService }) {
    dispatch(loadingSelectedBlock());
    let block = await  dependencies.blockListService.getBlock(blockHash);
    block = await dependencies.blockListService.loadAndAttachTransactionReceiptsForBlock(block);
    dispatch(loadedSelectedBlock(block));
  };
};
