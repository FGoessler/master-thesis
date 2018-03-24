import * as React from "react";
import { ContractValue } from "../AddressInspector/AddressInfoService";

export default function ContractData(props: { contractData: ContractValue[] | undefined }) {

  if (!props.contractData || (props.contractData && props.contractData[0].value === "0x")) {
    return (<div>No Contract Data</div>);
  }

  return (
    <div>
      <h4>Contract Data</h4>
      <table>
        <tbody>
        {props.contractData.map((c: ContractValue) =>
          <tr key={c.label}>
            <td>{c.label}</td>
            <td className="hash">{isTokenId(c) ? "0x" + c.value.toString(16) : c.value.toString(10)}</td>
          </tr>
        )}
        </tbody>
      </table>
    </div>
  );
}

function isTokenId(contractValue: ContractValue) {
  return contractValue.label === "activeTokenId" || contractValue.label === "soonExpiringTokenId";
}
