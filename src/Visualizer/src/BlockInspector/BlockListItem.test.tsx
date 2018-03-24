import * as React from "react";
import * as ReactDOM from "react-dom";
import { mount } from "enzyme";
import BlockListItem from "./BlockListItem";
import { Block } from "../Util/web3";
import { MockBlock } from "../Util/MockBlockchain";
import { noOp } from "../Util/testUtils";

it("shows information about a block", () => {
  const block: Block = new MockBlock(3);
  const item = document.createElement("div");
  ReactDOM.render(<BlockListItem block={block} onClick={noOp}/>, item);
  expect(item).toMatchSnapshot();
});

it("reports on click events", () => {
  const block: Block = new MockBlock(3);
  const clickHandler = jest.fn();
  const wrapper = mount(<BlockListItem block={block} onClick={clickHandler}/>);
  wrapper.find("li").simulate("click");
  expect(clickHandler).toHaveBeenCalledWith("0x2a");
});
