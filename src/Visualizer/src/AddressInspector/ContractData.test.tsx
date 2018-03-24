import * as React from "react";
import * as ReactDOM from "react-dom";
import ContractData from "./ContractData";

it("lists the contract data", async () => {
  const data = [
    {label: "a", value: 1},
    {label: "b", value: "123"},
  ];
  const item = document.createElement("div");
  ReactDOM.render(
    <ContractData
      contractData={data}
    />,
    item);
  expect(item).toMatchSnapshot();
});
