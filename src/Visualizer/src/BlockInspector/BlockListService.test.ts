import BlockListService from "./BlockListService";
import { Transaction, Web3 } from "../Util/web3";
import MockWeb3 from "../Util/MockBlockchain";

let service: BlockListService;
let web3: Web3;

beforeEach(() => {
  web3 = new MockWeb3();
  service = new BlockListService(web3);
});

it("provides a list of blocks starting with the latest", async () => {
  let blocks = await service.getBlocksStartingWithLatest();
  expect(blocks).toHaveLength(3);
});

it("provides a list of blocks starting with a specific block index", async () => {
  let blocks = await service.getBlocksStartingWith(1);
  expect(blocks).toHaveLength(2);
});

it("can deliver a specific block by its hash", async () => {
  let block = await service.getBlock("0x2a");
  expect(block.number).toEqual(1);
  expect(block.hash).toEqual("0x2a");
  expect(block.parentHash).toEqual("0x1a");
});

it("can load and attach the transaction receipts for a block", async () => {
  let origBlock = await service.getBlock("0x2a");
  let newBlock = await service.loadAndAttachTransactionReceiptsForBlock(origBlock);

  expect(origBlock.hash).toEqual("0x2a");
  expect(newBlock.hash).toEqual("0x2a");
  expect((<Transaction> origBlock.transactions[0]).transactionReceipt).toBeUndefined();
  expect((<Transaction> newBlock.transactions[0]).transactionReceipt).toBeDefined();
});
