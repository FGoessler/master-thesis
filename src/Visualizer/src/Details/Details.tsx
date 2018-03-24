import * as React from "react";
import BlockDetails from "../BlockInspector/BlockDetails";
import { connect } from "react-redux";
import { Block } from "../Util/web3";
import "./Details.css";
import { AppState } from "../App";
import { AddressInfo, DetailsMode } from "./DetailsReducers";
import AddressDetails from "../AddressInspector/AddressDetails";
import { loadAddressChartData, selectAddress } from "../Actions/SelectAddress";
import { Dispatch } from "redux";

interface DetailsProps {
  mode: DetailsMode;
  selectedBlock?: Block;
  selectedAddressInfo?: AddressInfo;
  addressSelectedHandler: (address: string) => void;
  onRequestOlderBlocks: (address: string, nextBlock: number) => void;
}

export class Details extends React.Component<DetailsProps, {}> {

  render() {
    switch (this.props.mode) {
      case DetailsMode.Nothing:
        return (<h3>Nothing selected.</h3>);

      case DetailsMode.Loading:
        return (<h3>Loading...</h3>);

      case DetailsMode.BlockDetails:
        if (!this.props.selectedBlock) {
          throw new Error("DetailsMode.BlockDetails but selectedBlock is missing.");
        }
        return (
          <BlockDetails
            block={this.props.selectedBlock}
            addressSelectedHandler={this.props.addressSelectedHandler}
          />
        );

      case DetailsMode.AddressDetails:
        if (!this.props.selectedAddressInfo) {
          throw new Error("DetailsMode.AddressDetails but selectedAddressInfo is missing.");
        }
        return (
          <AddressDetails
            address={this.props.selectedAddressInfo.address}
            currentBalance={this.props.selectedAddressInfo.balance}
            chartData={this.props.selectedAddressInfo.chartData}
            contractData={this.props.selectedAddressInfo.contractData}
            onRequestOlderBlocks={this.props.onRequestOlderBlocks}
          />
        );

      default:
        throw new Error(`Missing case - no details defined for '${this.props.mode}'.`);
    }
  }
}

const mapStateToProps = (state: AppState): Partial<DetailsProps> => {
  return state.details;
};

const mapDispatchToProps = (dispatch: Dispatch<AppState>): Partial<DetailsProps> => {
  return {
    addressSelectedHandler: (address: string) => {
      dispatch(selectAddress(address));
    },
    onRequestOlderBlocks: (address: string, nextBlock: number) => {
      dispatch(loadAddressChartData(address, nextBlock));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Details);
