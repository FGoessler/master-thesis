import * as React from "react";
import * as ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MockBlock } from "../Util/MockBlockchain";
import Details from "./Details";
import { DetailsMode } from "./DetailsReducers";
import { BigNumberHelper } from "../Util/bigNumber";
import { AppState } from "../App";

it("renders block details", () => {
  const mockStore = configureMockStore()({details: {
    mode: DetailsMode.BlockDetails,
    selectedBlock: new MockBlock(1)
  }});
  mockStore.dispatch = jest.fn();

  const div = document.createElement("div");
  ReactDOM.render(<Provider store={mockStore}><Details/></Provider>, div);
  expect(div).toMatchSnapshot();
});

it("renders address details", () => {
  const initialState: Partial<AppState> = {details: {
    mode: DetailsMode.AddressDetails,
    selectedAddressInfo: {
      address: "0x1234",
      balance: BigNumberHelper.toBigNumber(5000),
      chartData: {
        label: "",
        datapoints: [],
        labels: [],
        latestBlockNr: 0,
        oldestBlockNr: 0
      }
    }
  }};
  const mockStore = configureMockStore()(initialState);
  mockStore.dispatch = jest.fn();

  const div = document.createElement("div");
  ReactDOM.render(<Provider store={mockStore}><Details/></Provider>, div);
  expect(div).toMatchSnapshot();
});

it("renders nothing selected state", () => {
  const mockStore = configureMockStore()({details: {
    mode: DetailsMode.Nothing
  }});
  mockStore.dispatch = jest.fn();

  const div = document.createElement("div");
  ReactDOM.render(<Provider store={mockStore}><Details/></Provider>, div);
  expect(div).toMatchSnapshot();
});

it("renders loading state", () => {
  const mockStore = configureMockStore()({details: {
    mode: DetailsMode.Loading
  }});
  mockStore.dispatch = jest.fn();

  const div = document.createElement("div");
  ReactDOM.render(<Provider store={mockStore}><Details/></Provider>, div);
  expect(div).toMatchSnapshot();
});
