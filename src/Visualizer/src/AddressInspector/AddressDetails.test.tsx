import * as React from "react";
import * as ReactDOM from "react-dom";
import AddressDetails from "./AddressDetails";
import { BigNumberHelper } from "../Util/bigNumber";
import { ChartData } from "./BalanceChartCreator";
import { noOp } from "../Util/testUtils";
import { mount } from "enzyme";
import FeatureSwitchService from "../Util/FeatureSwitches";

const dummyChartData = {datapoints: [], label: "", labels: [], oldestBlockNr: 0, latestBlockNr: 0} as ChartData;

it("shows information about an address", async () => {
  const item = document.createElement("div");
  ReactDOM.render(
    <AddressDetails
      address={"0x123456789abcde"}
      currentBalance={BigNumberHelper.toBigNumber(10000)}
      chartData={dummyChartData}
      onRequestOlderBlocks={noOp}
    />,
    item);
  expect(item).toMatchSnapshot();
});

it("can handle undefined balance", async () => {
  const item = document.createElement("div");
  ReactDOM.render(
    <AddressDetails
      address={"0x123456789abcde"}
      currentBalance={undefined}
      chartData={dummyChartData}
      onRequestOlderBlocks={noOp}
    />,
    item);
  expect(item).toMatchSnapshot();
});

describe("chart", () => {

  beforeEach(() => {
    FeatureSwitchService.setFeatureSwitch("SHOW_ADDRESS_BALANCE_CHART_DATA", true);
  });

  afterEach(() => {
    FeatureSwitchService.setFeatureSwitch("SHOW_ADDRESS_BALANCE_CHART_DATA", false);
  });

  it("shows a chart", async () => {
    const item = document.createElement("div");
    const chartData = {
      label: "the chart",
      datapoints: [1, 3, 6, 9], labels: ["1", "2", "3", "4"],
      oldestBlockNr: 2, latestBlockNr: 5
    };
    ReactDOM.render(
      <AddressDetails
        address={"0x123456789abcde"}
        currentBalance={undefined}
        chartData={chartData}
        onRequestOlderBlocks={noOp}
      />,
      item);
    expect(item).toMatchSnapshot();
  });

  it("propagates the click on the request older blocks button", async () => {
    const requestOlderBlocks = jest.fn();
    const chartData = {
      label: "the chart",
      datapoints: [1, 3, 6, 9], labels: ["1", "2", "3", "4"],
      oldestBlockNr: 2, latestBlockNr: 5
    };
    const list = mount(
      <AddressDetails
        address={"0x123456789abcde"}
        currentBalance={undefined}
        chartData={chartData}
        onRequestOlderBlocks={requestOlderBlocks}
      />);
    list.find("button").first().simulate("click");

    expect(requestOlderBlocks).toHaveBeenCalledWith("0x123456789abcde", chartData.oldestBlockNr - 1);
  });

});
