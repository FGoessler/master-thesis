const promisify = require("util.promisify");
import { Block, isTransaction, Transaction, Web3 } from "../Util/web3";
import BatchBlockProcessor from "../Util/BatchBlockProcessor";

export default class BlockListService {

  private web3: Web3;

  constructor(web3: Web3) {
    this.web3 = web3;
  }

  public async getBlocksStartingWithLatest(
    limit: number = 3000,
    intermediateUpdateHandler?: (b: Block[]) => void
  ) {
    const latestBlock = await this.getBlock("latest");
    return await this.getBlocksStartingWith(latestBlock.number, limit, intermediateUpdateHandler);
  }

  public async getBlocksStartingWith(
    startBlock: number,
    limit: number = 3000,
    intermediateUpdateHandler?: (b: Block[]) => void
  ) {
    const dataFetchingAction = async (blockNumber: number) => {
      return await this.getBlock(blockNumber);
    };
    const batchProcessor = new BatchBlockProcessor<Block>(dataFetchingAction, intermediateUpdateHandler);
    let data = await batchProcessor.startLoading(startBlock, limit, 25);
    return data.datapoints;
  }

  public async getBlock(hash: number | string): Promise<Block> {
    const block = await promisify(this.web3.eth.getBlock.bind(this.web3.eth))(hash, true);
    for (let transaction of block.transactions) {
      transaction.isContractDeployment = !transaction.to;
    }
    return block;
  }

  public async loadAndAttachTransactionReceiptsForBlock(block: Block): Promise<Block> {
    let updatedTransactions: Transaction[] = [];
    for (let transaction of block.transactions) {
      if (isTransaction(transaction)) {
        let newTransaction = {...transaction};
        newTransaction.transactionReceipt = await this.getTransactionReceipt(transaction.hash);
        updatedTransactions.push(newTransaction);
      }
    }
    return {...block, transactions: updatedTransactions};
  }

  private getTransactionReceipt(hash: string) {
    return promisify(this.web3.eth.getTransactionReceipt.bind(this.web3.eth))(hash);
  }
}
