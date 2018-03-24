import * as React from "react";
import { Block } from "../Util/web3";
import StringFormatter from "../Util/stringFormatter";

interface BlockListItemProps {
  block: Block;
  onClick: (blockHash: string) => void;
}

export default class BlockListItem extends React.Component<BlockListItemProps, {}> {

  constructor(props: BlockListItemProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onClick(this.props.block.hash);
  }

  render() {
    return (
      <li className="list-item" onClick={this.onClick}>
        {this.props.block.number} - <span className="hash">{StringFormatter.trimHash(this.props.block.hash)}</span>
      </li>
    );
  }
}
