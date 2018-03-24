import { isLoadedBlocks, isLoadingBlocks } from "../Actions/LoadBlocks";
import { Action, combineReducers } from "redux";
import { Block } from "../Util/web3";
import { isAddAddress } from "../Actions/AddAddress";

export type ListState = {
  blocks: Block[],
  latestBlockNr: number,
  oldestBlockNr: number,
  isLoadingBlocks: boolean,
  addresses: string[]
};

export const blocksReducer = (state: Block[] = [], action: Action): Block[] => {
  if (isLoadedBlocks(action)) {
    return action.blocks;
  } else {
    return state;
  }
};

export const latestBlockReducer = (state: number = 0, action: Action): number => {
  if (isLoadedBlocks(action)) {
    return Math.max(state, action.latestBlockNr);
  } else {
    return state;
  }
};

export const oldestBlockReducer = (state: number = 0, action: Action): number => {
  if (isLoadedBlocks(action)) {
    if (state === 0) {
      return action.oldestBlockNr;
    } else {
      return Math.min(state, action.oldestBlockNr);
    }
  } else {
    return state;
  }
};

export const isLoadingReducer = (state: boolean = false, action: Action): boolean => {
  if (isLoadingBlocks(action)) {
    return action.loading;
  } else {
    return state;
  }
};

export const addAddressReducer = (state: string[] = [], action: Action): string[] => {
  if (isAddAddress(action)) {
    if (state.indexOf(action.address) === -1) {
      return state.concat(action.address);
    } else {
      return state;
    }
  } else {
    return state;
  }
};

export const listReducer = combineReducers({
  blocks: blocksReducer,
  oldestBlockNr: oldestBlockReducer,
  latestBlockNr: latestBlockReducer,
  isLoadingBlocks: isLoadingReducer,
  addresses: addAddressReducer
});
