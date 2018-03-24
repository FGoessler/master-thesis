import * as React from "react";
import "./App.css";
import List from "./List/List";
import Details from "./Details/Details";
import { ListState } from "./List/ListReducers";
import { DetailsState } from "./Details/DetailsReducers";

export interface AppState {
  details: DetailsState;
  list: ListState;
}

export default class App extends React.Component<{}, {}> {

  render() {
    return (
      <div className="container-fluid" style={{height: "100vh"}}>
        <div className="row full-height">
          <div className="col-xs-4 list full-height">
            <List />
          </div>
          <div className="col-xs-8 details full-height">
            <Details />
          </div>
        </div>
      </div>
    );
  }
}
