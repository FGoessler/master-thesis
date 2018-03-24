import MockWeb3 from "../Util/MockBlockchain";
import AddressInfoService from "../AddressInspector/AddressInfoService";
import { loadAddressChartData, loadedAddressChartData, loadedAddressInfo, selectAddress } from "./SelectAddress";
import { BigNumberHelper } from "../Util/bigNumber";
import { BalanceChartCreator } from "../AddressInspector/BalanceChartCreator";
import BlockListService from "../BlockInspector/BlockListService";
import AppModule from "../AppModule";

let fakeDispatch = jest.fn();
let fakeBalanceChartCreator: BalanceChartCreator;
let dependencies: AppModule;

beforeEach(async () => {
  fakeDispatch = jest.fn();
  const fakeBlockListService = new BlockListService(new MockWeb3());
  const fakeAddressInfoService = new AddressInfoService(new MockWeb3());
  fakeBalanceChartCreator = new BalanceChartCreator(fakeAddressInfoService, fakeBlockListService);

  dependencies = {
    addressInfoService: fakeAddressInfoService,
    balanceChartCreator: fakeBalanceChartCreator
  } as AppModule;
});

it("dispatches a loaded address info action on success", async () => {
  await selectAddress("0x1234")(fakeDispatch, {}, dependencies);
  expect(fakeDispatch).toHaveBeenCalledWith(loadedAddressInfo("0x1234", BigNumberHelper.toBigNumber("9900000")));
});

it("dispatches a loaded address chart data action when the balance chart creator got data", async () => {
  await loadAddressChartData("0x1234")(fakeDispatch, {}, dependencies);

  const chartData = {label: "chart", datapoints: [1, 5, 7, 23], labels: [], latestBlockNr: 2, oldestBlockNr: 5};
  fakeBalanceChartCreator.newChartDataCallback("0x1234", chartData);

  const expectedAction = loadedAddressChartData("0x1234", chartData);
  expect(fakeDispatch).toHaveBeenCalledWith(expectedAction);
});
