import * as React from "react";
import { Transaction } from "../Util/web3";
import StringFormatter from "../Util/stringFormatter";
const ABIDecoder: any = require("abi-decoder");
import { abi } from "../Util/contractAbi";
import "./BlockDetails.css";

ABIDecoder.addABI(abi);

export interface TransactionDetailsProps {
  transaction: Transaction;
  addressSelectedHandler: (address: string) => void;
}

export default function TransactionDetails(props: TransactionDetailsProps) {
  const t = props.transaction;

  const gasUsed = t.transactionReceipt ? t.transactionReceipt.gasUsed.toString(10) : "-";

  if (t.isContractDeployment) {
    return (
      <li key={t.hash}>
        {StringFormatter.trimHash(t.hash)}<br />
        <span className="highlight">Contract Deployment Transaction</span><br />
        From:
        <a className="fromAddress hash" onClick={() => props.addressSelectedHandler(t.from)}>
          {StringFormatter.trimHash(t.from)}
        </a><br />
        Sum: <span className="hash">{t.value.toString(10)} WEI</span><br />
        Gas used: <span className="hash">{gasUsed} WEI</span><br />
      </li>
    );
  } else {
    const logs = t.transactionReceipt && t.transactionReceipt.logs.length > 0 ?
      JSON.stringify(ABIDecoder.decodeLogs(t.transactionReceipt.logs)) : "No logs";
    return (
      <li key={t.hash}>
        {StringFormatter.trimHash(t.hash)}<br />
        From:
        <a className="fromAddress hash" onClick={() => props.addressSelectedHandler(t.from)}>
          {StringFormatter.trimHash(t.from)}
        </a><br />
        To:
        <a className="toAddress hash" onClick={() => props.addressSelectedHandler(t.to)}>
          {StringFormatter.trimHash(t.to)}
        </a><br />
        Sum: <span className="hash">{t.value.toString(10)} WEI</span><br />
        Gas used: <span className="hash">{gasUsed} WEI</span><br />
        Transaction Data:
        <div className="json">
          {JSON.stringify(ABIDecoder.decodeMethod(t.input))}
        </div>
        Logs:
        <div className="json">
          {logs}
        </div>
      </li>
    );
  }
}
