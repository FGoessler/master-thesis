import * as React from "react";
import BlockListItem from "./BlockListItem";
import { Block } from "../Util/web3";

interface BlockListProps {
  onSelectionChange: (blockHash: string) => void;
  onRequestOlderBlocks: (nextBlock: number) => void;
  blocks: Block[];
  loading: boolean;
  latestBlockNr: number;
  oldestBlockNr: number;
}

export default function BlockList(props: BlockListProps) {
  const listItems = props.blocks.map((n) => {
    return <BlockListItem key={n.number.toString()} block={n} onClick={props.onSelectionChange}/>;
  });
  let loadingIndicator = undefined;
  if (props.loading) {
    loadingIndicator = <span>Loading blocks...</span>;
  }
  return (
    <div>
      <h3>Blocks</h3>
      <p>(Only showing blocks with transactions)</p>
        {loadingIndicator}
      <ul>
        {listItems}
      </ul>
      <p>Loaded blocks {props.latestBlockNr} to {props.oldestBlockNr}.</p>
      <button onClick={() => props.onRequestOlderBlocks(props.oldestBlockNr - 1)}>Load older blocks</button>
    </div>
  );
}
