import * as React from "react";
import * as ReactDOM from "react-dom";
import configureMockStore, { MockStore } from "redux-mock-store";
import List from "./List";
import { Provider } from "react-redux";
import { MockBlock } from "../Util/MockBlockchain";
import { loadBlocks } from "../Actions/LoadBlocks";
import Mock = jest.Mock;
import { AppState } from "../App";

let mockStore: MockStore<{}>;

beforeEach(() => {
  const initialState: Partial<AppState> = {
    list: {
      blocks: [new MockBlock(1), new MockBlock(2)],
      latestBlockNr: 1,
      oldestBlockNr: 0,
      isLoadingBlocks: false,
      addresses: ["0x1234567890"]
    }
  };
  mockStore = configureMockStore()(initialState);
  mockStore.dispatch = jest.fn();
});

it("renders correctly", () => {
  const div = document.createElement("div");
  ReactDOM.render(<Provider store={mockStore}><List/></Provider>, div);
  expect(div).toMatchSnapshot();
});

it("renders loading state correctly", () => {
  const initialState: Partial<AppState> = {
    list: {
      blocks: [],
      latestBlockNr: 0,
      oldestBlockNr: 0,
      isLoadingBlocks: true,
      addresses: []
    }
  };
  mockStore = configureMockStore()(initialState);
  mockStore.dispatch = jest.fn();

  const div = document.createElement("div");
  ReactDOM.render(<Provider store={mockStore}><List/></Provider>, div);
  expect(div).toMatchSnapshot();
});

it("triggers block load on mount", () => {
  const div = document.createElement("div");
  ReactDOM.render(<Provider store={mockStore}><List/></Provider>, div);
  expect((mockStore.dispatch as Mock<Function>).mock.calls[0][0].toString()).toEqual(loadBlocks().toString());
});
