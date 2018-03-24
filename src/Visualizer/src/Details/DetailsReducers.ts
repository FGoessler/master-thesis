import { isLoadedSelectedBlock, isLoadingSelectedBlock } from "../Actions/LoadBlock";
import { Block } from "../Util/web3";
import { Action } from "redux";
import { isLoadedAddressChartData, isLoadedAddressInfo, isLoadedContractData } from "../Actions/SelectAddress";
import { BigNumber } from "../Util/bigNumber";
import { ChartData } from "../AddressInspector/BalanceChartCreator";
import { ContractValue } from "../AddressInspector/AddressInfoService";

export interface DetailsState {
  mode: DetailsMode;
  selectedBlock?: Block;
  selectedAddressInfo?: AddressInfo;
}

export enum DetailsMode {
  Nothing,
  Loading,
  BlockDetails,
  AddressDetails
}

export interface AddressInfo {
  address: string;
  balance: BigNumber;
  chartData: ChartData;
  contractData?: ContractValue[];
}

const mergeChartData = (existingData: ChartData, newData: ChartData) => {
  let mergedOldestBlockNr: number;
  if (existingData.oldestBlockNr > 0) {
    mergedOldestBlockNr = Math.min(newData.oldestBlockNr, existingData.oldestBlockNr);
  } else {
    mergedOldestBlockNr = newData.oldestBlockNr;
  }

  return {
    label: newData.label,
    labels: existingData.labels.concat(newData.labels),
    datapoints: existingData.datapoints.concat(newData.datapoints),
    latestBlockNr: Math.max(newData.latestBlockNr, existingData.latestBlockNr),
    oldestBlockNr: mergedOldestBlockNr
  };
};

export const detailsReducer = (state: DetailsState = {
                                 mode: DetailsMode.Nothing,
                                 selectedBlock: undefined,
                                 selectedAddressInfo: undefined
                               },
                               action: Action): DetailsState => {
  if (isLoadedAddressInfo(action)) {
    return {
      mode: DetailsMode.AddressDetails,
      selectedAddressInfo: {
        address: action.address,
        balance: action.balance,
        chartData: {label: "", datapoints: [], labels: [], latestBlockNr: 0, oldestBlockNr: 0},
      }
    };
  } else if (isLoadedSelectedBlock(action)) {
    return {
      mode: DetailsMode.BlockDetails,
      selectedBlock: action.block
    };
  } else if (
    isLoadedAddressChartData(action) &&
    state.mode === DetailsMode.AddressDetails &&
    state.selectedAddressInfo
  ) {
    return {...state,
      selectedAddressInfo: {...state.selectedAddressInfo,
        chartData: mergeChartData(state.selectedAddressInfo.chartData, action.chartData)
      }
    };
  } else if (
    isLoadedContractData(action) &&
    state.mode === DetailsMode.AddressDetails &&
    state.selectedAddressInfo
  ) {
    return {...state,
      selectedAddressInfo: {...state.selectedAddressInfo,
        contractData: action.contractData
      }
    };
  } else if (isLoadingSelectedBlock(action)) {
    return {
      mode: DetailsMode.Loading,
      selectedBlock: undefined,
      selectedAddressInfo: undefined
    };
  } else {
    return state;
  }
};
