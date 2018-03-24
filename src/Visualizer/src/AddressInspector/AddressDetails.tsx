import * as React from "react";
import StringFormatter from "../Util/stringFormatter";
import { BigNumber } from "../Util/bigNumber";
import { Line } from "react-chartjs-2";
import { ChartData } from "./BalanceChartCreator";
import { ContractValue } from "./AddressInfoService";
import ContractData from "./ContractData";
import FeatureSwitchService from "../Util/FeatureSwitches";

const chartConfig = {
  labels: [] as string[],
  datasets: [
    {
      label: "",
      fill: false,
      lineTension: 0.1,
      backgroundColor: "rgba(75,192,192,0.4)",
      borderColor: "rgba(75,192,192,1)",
      borderCapStyle: "butt",
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: "miter",
      pointBorderColor: "rgba(75,192,192,1)",
      pointBackgroundColor: "#fff",
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "rgba(75,192,192,1)",
      pointHoverBorderColor: "rgba(220,220,220,1)",
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: [] as number[]
    }
  ]
};

interface AddressDetailsProps {
  address: string;
  currentBalance?: BigNumber;
  chartData: ChartData;
  contractData?: ContractValue[];
  onRequestOlderBlocks: (address: string, nextBlockNr: number) => void;
}

export default function AddressDetails(props: AddressDetailsProps) {

  let chart = undefined;
  if (FeatureSwitchService.getFeatureSwitch("SHOW_ADDRESS_BALANCE_CHART_DATA")) {
    if (props.chartData.datapoints.length > 0) {
      const config = Object.assign({}, chartConfig);
      config.labels = props.chartData.labels;
      config.datasets[0].label = props.chartData.label;
      config.datasets[0].data = props.chartData.datapoints;
      chart = (
        <div>
          <h4>Balance Chart</h4>
          <Line data={config}/>
          <button onClick={() => props.onRequestOlderBlocks(props.address, props.chartData.oldestBlockNr - 1)}>
            Load data for older blocks
          </button>
        </div>
      );
    } else {
      chart = <span>Chart loading...</span>;
    }
  }

  return (
    <div>
      <h3>
        {StringFormatter.trimHash(props.address)}
      </h3>
      <table>
        <tbody>
        <tr>
          <td>Address</td>
          <td className="hash">{StringFormatter.trimHash(props.address)}</td>
        </tr>
        <tr>
          <td>Balance</td>
          <td>{props.currentBalance ? props.currentBalance.toString(10) : "..."}</td>
        </tr>
        </tbody>
      </table>
      <ContractData contractData={props.contractData}/>
      {chart}
    </div>
  );
}
