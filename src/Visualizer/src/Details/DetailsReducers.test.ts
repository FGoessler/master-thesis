import { loadedSelectedBlock, loadingSelectedBlock } from "../Actions/LoadBlock";
import { DetailsMode, detailsReducer, DetailsState } from "./DetailsReducers";
import { MockBlock } from "../Util/MockBlockchain";
import { loadedAddressChartData, loadedAddressInfo, loadedContractData } from "../Actions/SelectAddress";
import { BigNumberHelper } from "../Util/bigNumber";
import { ChartData } from "../AddressInspector/BalanceChartCreator";

it("handles the LoadingSelectedBlock action", () => {
  const newState: DetailsState = detailsReducer(undefined, loadingSelectedBlock());
  expect(newState.selectedBlock).toBeUndefined();
  expect(newState.selectedAddressInfo).toBeUndefined();
  expect(newState.mode).toEqual(DetailsMode.Loading);
});

it("handles the LoadedSelectedBlock action", () => {
  const block = new MockBlock(2);
  const newState: DetailsState = detailsReducer(undefined, loadedSelectedBlock(block));
  expect(newState.selectedBlock).toEqual(block);
  expect(newState.mode).toEqual(DetailsMode.BlockDetails);
});

it("handles the LoadedAddressInfo action", () => {
  const action = loadedAddressInfo("0x1234", BigNumberHelper.toBigNumber(200));
  const newState: DetailsState = detailsReducer(undefined, action);
  if (!newState.selectedAddressInfo) { fail(); return; }
  expect(newState.selectedAddressInfo.address).toEqual("0x1234");
  expect(newState.selectedAddressInfo.balance).toEqual(BigNumberHelper.toBigNumber(200));
  expect(newState.mode).toEqual(DetailsMode.AddressDetails);
});

const initialChartData: ChartData = {
  label: "",
    datapoints: [] as number[],
    labels: [] as string[],
    latestBlockNr: 0,
    oldestBlockNr: 0
};

it("handles the LoadedAddressChartData action", () => {
  const prevState = {
    mode: DetailsMode.AddressDetails,
    selectedAddressInfo: {
      address: "0x1234",
      balance: BigNumberHelper.toBigNumber(200),
      chartData: initialChartData
    }
  };
  const action = loadedAddressChartData("0x1234", {
    label: "chart label", datapoints: [1, 5, 8], labels: ["1", "2", "3"], latestBlockNr: 5, oldestBlockNr: 2
  });

  const newState: DetailsState = detailsReducer(prevState, action);

  expect(newState).toEqual({
    mode: DetailsMode.AddressDetails,
    selectedAddressInfo: {
      address: "0x1234",
      balance: BigNumberHelper.toBigNumber(200),
      chartData: {
        label: "chart label",
        datapoints: [1, 5, 8],
        labels: ["1", "2", "3"],
        latestBlockNr: 5,
        oldestBlockNr: 2
      }
    }
  });
});

it("handles the LoadedContractData action", () => {
  const prevState = {
    mode: DetailsMode.AddressDetails,
    selectedAddressInfo: {
      address: "0x1234",
      balance: BigNumberHelper.toBigNumber(200),
      chartData: initialChartData
    }
  };
  const action = loadedContractData("0x1234", [{label: "a", value: 1}]);

  const newState: DetailsState = detailsReducer(prevState, action);

  expect(newState).toEqual({
    mode: DetailsMode.AddressDetails,
    selectedAddressInfo: {
      address: "0x1234",
      balance: BigNumberHelper.toBigNumber(200),
      chartData: initialChartData,
      contractData: [{label: "a", value: 1}]
    }
  });
});
