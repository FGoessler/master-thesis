import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockList from "./BlockList";
import { MockBlock } from "../Util/MockBlockchain";
import { mount } from "enzyme";
import { noOp } from "../Util/testUtils";

it("shows a list of blocks from the BlockListService", () => {
  const blocks = [
    new MockBlock(1), new MockBlock(2), new MockBlock(3), new MockBlock(4), new MockBlock(5)
  ];

  const list = document.createElement("div");
  ReactDOM.render(
    <BlockList
      blocks={blocks} loading={false}
      latestBlockNr={100} oldestBlockNr={50}
      onSelectionChange={noOp} onRequestOlderBlocks={noOp}
    />,
    list
  );
  expect(list).toMatchSnapshot();
});

it("propagates the click on children", () => {
  const blocks = [
    new MockBlock(1), new MockBlock(2), new MockBlock(3), new MockBlock(4), new MockBlock(5)
  ];
  const selectionChange = jest.fn();
  const list = mount(
    <BlockList
      blocks={blocks} loading={false}
      latestBlockNr={100} oldestBlockNr={50}
      onSelectionChange={selectionChange} onRequestOlderBlocks={noOp}
    />
  );

  list.find("li").first().simulate("click");

  expect(selectionChange).toHaveBeenCalledWith("0x2a");
});

it("can show a loading indicator", () => {
  const list = document.createElement("div");
  ReactDOM.render(
    <BlockList
      blocks={[]} loading={true}
      latestBlockNr={100} oldestBlockNr={50}
      onSelectionChange={noOp} onRequestOlderBlocks={noOp}
    />,
    list
  );
  expect(list).toMatchSnapshot();
});

it("propagates the click on the load older blocks button", () => {
  const requestBlocks = jest.fn();
  const list = mount(
    <BlockList
      blocks={[]} loading={false}
      latestBlockNr={100} oldestBlockNr={50}
      onSelectionChange={noOp} onRequestOlderBlocks={requestBlocks}
    />
  );

  list.find("button").first().simulate("click");

  expect(requestBlocks).toHaveBeenCalledWith(49);
});
