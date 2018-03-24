import * as React from "react";
import Blocklist from "../BlockInspector/BlockList";
import "./List.css";
import { connect, Dispatch } from "react-redux";
import { selectBlock } from "../Actions/LoadBlock";
import { loadBlocks } from "../Actions/LoadBlocks";
import { Block } from "../Util/web3";
import { AppState } from "../App";
import AddressList from "../AddressInspector/AddressList";
import { addAddress } from "../Actions/AddAddress";
import { selectAddress } from "../Actions/SelectAddress";

interface ListProps {
  blocks: Block[];
  latestBlockNr: number;
  oldestBlockNr: number;
  onSelectionChange: (blockHash: string) => void;
  onRequestOlderBlocks: (nextBlock: number) => void;
  loadBlocks: () => void;
  isLoadingBlocks: boolean;
  addresses: string[];
  addressAddHandler: (address: string) => void;
  addressSelectedHandler: (address: string) => void;
}

export class List extends React.Component<ListProps, {}> {

  componentWillMount() {
    if (this.props.loadBlocks) {
      this.props.loadBlocks();
    }
  }

  render() {
    return (
      <div>
        <Blocklist
          blocks={this.props.blocks}
          loading={this.props.isLoadingBlocks}
          latestBlockNr={this.props.latestBlockNr}
          oldestBlockNr={this.props.oldestBlockNr}
          onSelectionChange={this.props.onSelectionChange}
          onRequestOlderBlocks={this.props.onRequestOlderBlocks}
        />
        <AddressList
          addresses={this.props.addresses}
          addressAddHandler={this.props.addressAddHandler}
          addressSelectedHandler={this.props.addressSelectedHandler}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: AppState): Partial<ListProps> => {
  return state.list;
};

const mapDispatchToProps = (dispatch: Dispatch<AppState>): Partial<ListProps> => {
  return {
    onSelectionChange: (blockHash: string) => {
      dispatch(selectBlock(blockHash));
    },
    onRequestOlderBlocks: (nextBlock: number) => {
      dispatch(loadBlocks(nextBlock));
    },
    loadBlocks: () => {
      dispatch(loadBlocks());
    },
    addressAddHandler: (address: string) => {
      dispatch(addAddress(address));
    },
    addressSelectedHandler: (address: string) => {
      dispatch(selectAddress(address));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
