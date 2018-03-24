import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import thunkMiddleware from "redux-thunk";
import { applyMiddleware, createStore } from "redux";
import { rootReducer } from "./reducers";
import AppModule from "./AppModule";
import BlockListService from "./BlockInspector/BlockListService";
import MockWeb3 from "./Util/MockBlockchain";
import AddressInfoService from "./AddressInspector/AddressInfoService";
import { BalanceChartCreator } from "./AddressInspector/BalanceChartCreator";

it("renders without crashing", () => {
  const mockWeb3 = new MockWeb3();
  const blockListService = new BlockListService(mockWeb3);
  const addressInfoService = new AddressInfoService(mockWeb3);
  const balanceChartCreator = new BalanceChartCreator(addressInfoService, blockListService);
  const module = {
    blockListService, addressInfoService, balanceChartCreator
  } as AppModule;

  const store = createStore(
    rootReducer,
    applyMiddleware(
      thunkMiddleware.withExtraArgument(module)
    )
  );

  const div = document.createElement("div");
  ReactDOM.render(<Provider store={store}><App/></Provider>, div);
});
