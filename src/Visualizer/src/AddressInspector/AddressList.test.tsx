import * as React from "react";
import * as ReactDOM from "react-dom";
import AddressList from "./AddressList";
import { mount } from "enzyme";
import { noOp, simulateInput } from "../Util/testUtils";

it("shows a list of addresses", async () => {
  const item = document.createElement("div");
  ReactDOM.render(
    <AddressList
      addresses={["0x123456789abcde", "0xabcdef1234567890"]}
      addressAddHandler={noOp}
      addressSelectedHandler={noOp}
    />,
    item);
  expect(item).toMatchSnapshot();
});

it("fires the add address callback correctly", () => {
  const addressAddHandler = jest.fn();
  const list = mount(
    <AddressList
      addresses={[]}
      addressAddHandler={addressAddHandler}
      addressSelectedHandler={noOp}
    />);

  simulateInput(list.find("input"), "0x123456789");
  list.find("button").first().simulate("click");

  expect(addressAddHandler).toHaveBeenCalledWith("0x123456789");
});

it("propagates the click on addresses", () => {
  const selectionChange = jest.fn();
  const list = mount(<AddressList
    addresses={["0x12345"]}
    addressSelectedHandler={selectionChange}
    addressAddHandler={noOp}/>);

  list.find("li").first().simulate("click");

  expect(selectionChange).toHaveBeenCalledWith("0x12345");
});
