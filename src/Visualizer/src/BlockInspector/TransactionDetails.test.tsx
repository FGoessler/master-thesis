import * as React from "react";
import * as ReactDOM from "react-dom";
import TransactionDetails from "./TransactionDetails";
import { MockTransaction } from "../Util/MockBlockchain";
import { noOp } from "../Util/testUtils";
import { mount } from "enzyme";

it("shows information about a normal transaction", async () => {
  const mockTransaction = new MockTransaction();
  mockTransaction.transactionReceipt = {
    blockHash: "0x2a",
    blockNumber: 1,
    transactionHash: "0xffff1a",
    gasUsed: 10000,
    logs: []
  };
  const item = document.createElement("div");
  ReactDOM.render(<TransactionDetails transaction={mockTransaction} addressSelectedHandler={noOp}/>, item);
  expect(item).toMatchSnapshot();
});

it("shows information about a contract deployment transaction", async () => {
  const mockTransaction = new MockTransaction();
  mockTransaction.to = "";
  mockTransaction.isContractDeployment = true;
  const item = document.createElement("div");
  ReactDOM.render(<TransactionDetails transaction={mockTransaction} addressSelectedHandler={noOp}/>, item);
  expect(item).toMatchSnapshot();
});

it("propagates the click on addresses", () => {
  const mockTransaction = new MockTransaction();
  const selectionChange = jest.fn();
  const list = mount(<TransactionDetails
    transaction={mockTransaction}
    addressSelectedHandler={selectionChange}
  />);

  list.find(".fromAddress").first().simulate("click");
  expect(selectionChange).toHaveBeenCalledWith("0xdd1a");

  list.find(".toAddress").first().simulate("click");
  expect(selectionChange).toHaveBeenCalledWith("0xdd2b");
});
