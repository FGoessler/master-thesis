import * as React from "react";
import { Block, Transaction } from "../Util/web3";
import StringFormatter from "../Util/stringFormatter";
import TransactionDetails from "./TransactionDetails";

export default function BlockDetails(props: { block: Block, addressSelectedHandler: (address: string) => void }) {
  return (
    <div>
      <h3>
        {StringFormatter.trimHash(props.block.hash)}
      </h3>
      <table className="detailsTable">
        <tbody>
        <tr>
          <td>Hash</td>
          <td className="hash">{StringFormatter.trimHash(props.block.hash)}</td>
        </tr>
        <tr>
          <td>Number</td>
          <td>{props.block.number}</td>
        </tr>
        <tr>
          <td>Timestamp</td>
          <td>{new Date(props.block.timestamp * 1000).toUTCString()}</td>
        </tr>
        <tr>
          <td>Parent Hash</td>
          <td className="hash">{StringFormatter.trimHash(props.block.parentHash)}</td>
        </tr>
        <tr>
          <td>Transactions</td>
          <td>
            <ul>
              {props.block.transactions.map((t: Transaction) =>
                <TransactionDetails
                  transaction={t}
                  addressSelectedHandler={props.addressSelectedHandler}
                  key={t.hash}
                />
              )}
            </ul>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  );
}
