import { Action, Dispatch } from "redux";
import { BigNumber } from "../Util/bigNumber";
import AddressInfoService, { ContractValue } from "../AddressInspector/AddressInfoService";
import { BalanceChartCreator, ChartData } from "../AddressInspector/BalanceChartCreator";
import FeatureSwitchService from "../Util/FeatureSwitches";

export interface LoadedAddressInfo extends Action {
  type: string;
  address: string;
  balance: BigNumber;
}

export function isLoadedAddressInfo(action: Action): action is LoadedAddressInfo {
  return action.type === "LoadedAddressInfo";
}

export const loadedAddressInfo = (address: string, balance: BigNumber): LoadedAddressInfo => {
  return {
    type: "LoadedAddressInfo",
    address,
    balance
  };
};

export interface LoadedAddressChartData extends Action {
  type: string;
  address: string;
  chartData: ChartData;
}

export function isLoadedAddressChartData(action: Action): action is LoadedAddressChartData {
  return action.type === "LoadedAddressChartData";
}

export const loadedAddressChartData = (address: string, chartData: ChartData): LoadedAddressChartData => {
  return {
    type: "LoadedAddressChartData",
    address,
    chartData
  };
};

export interface LoadedContractData extends Action {
  type: string;
  address: string;
  contractData: ContractValue[];
}

export function isLoadedContractData(action: Action): action is LoadedContractData {
  return action.type === "LoadedContractData";
}

export const loadedContractData = (address: string, contractData: ContractValue[]): LoadedContractData => {
  return {
    type: "LoadedContractData",
    address,
    contractData
  };
};

export const loadAddressChartData = (address: string, startingBlock?: number) => {
  return function (dispatch: Dispatch<{}>, _: {},
                   dependencies: {balanceChartCreator: BalanceChartCreator}) {
    dependencies.balanceChartCreator.newChartDataCallback = (chartDataAddress, data) => {
      dispatch(loadedAddressChartData(chartDataAddress, data));
    };
    if (typeof startingBlock === "number") {
      return dependencies.balanceChartCreator.getChartDataStartingWith(address, startingBlock);
    } else {
      return dependencies.balanceChartCreator.getChartDataStartingWithLatestBlock(address);
    }
  };
};

export const loadContractData = (address: string) => {
  return async function (dispatch: Dispatch<{}>, _: {}, dependencies: {
    addressInfoService: AddressInfoService, balanceChartCreator: BalanceChartCreator })
  {
    const contractData = await dependencies.addressInfoService.getContractData(address);
    if (contractData !== undefined) {
      dispatch(loadedContractData(address, contractData));
    } else {
      console.warn("contract data load failed");
    }
  };
};

export const selectAddress = (address: string) => {
  return function (dispatch: Dispatch<{}>, _: {},
                   dependencies: {addressInfoService: AddressInfoService, balanceChartCreator: BalanceChartCreator}) {
    const loadAddressPromise = dependencies.addressInfoService.getBalance(address)
      .then((balance: BigNumber) => {
        dispatch(loadedAddressInfo(address, balance));
        dispatch(loadContractData(address));
        if (FeatureSwitchService.getFeatureSwitch("SHOW_ADDRESS_BALANCE_CHART_DATA")) {
          dispatch(loadAddressChartData(address));
        }
      });

    return loadAddressPromise;
  };
};
