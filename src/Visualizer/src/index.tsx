import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { applyMiddleware, compose, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import { rootReducer } from "./reducers";
import AppModule from "./AppModule";

const dependencies = new AppModule();

/* eslint-disable no-underscore-dangle */
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(
    thunkMiddleware.withExtraArgument(dependencies)
  ))
);

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById("root") as HTMLElement
);
registerServiceWorker();
