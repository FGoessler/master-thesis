import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockDetails from "./BlockDetails";
import { MockBlock, MockTransaction } from "../Util/MockBlockchain";
import { noOp } from "../Util/testUtils";

it("shows information about a block loaded from the blocklist service", async () => {
  const mockBlock = new MockBlock(1);
  mockBlock.transactions = [new MockTransaction()];
  const item = document.createElement("div");
  ReactDOM.render(<BlockDetails block={mockBlock} addressSelectedHandler={noOp}/>, item);
  expect(item).toMatchSnapshot();
});
