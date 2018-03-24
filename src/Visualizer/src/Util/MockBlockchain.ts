
import { Block, Eth, Web3, Transaction, TransactionReceipt } from "./web3";
import { BigNumber, BigNumberHelper } from "./bigNumber";

export class MockBlock implements Block {
  number: number = 1;
  hash: string = "0x2a";
  parentHash: string = "0x1a";
  timestamp: number = 100000;
  transactions: (string | Transaction)[] = [];

  constructor(num: number = 1) {
    this.number = num;
  }
}

export class MockTransaction implements Transaction {
  hash: string = "0xffff1a";
  from: string = "0xdd1a";
  to: string  = "0xdd2b";
  value: BigNumber = BigNumberHelper.toBigNumber(0);
  input: string = "";
  transactionReceipt?: TransactionReceipt;
  isContractDeployment: boolean = false;
}

export default class MockWeb3 implements Web3 {

  public eth: Eth;

  constructor() {
    this.eth = new MockEth();
  }
}

export class MockEth implements Eth {

  public transactionReceipts: { [key: string]: TransactionReceipt };
  public blocks: Block[];
  public balances: {};

  constructor() {
    this.transactionReceipts = {
      "0xffff1a": {
        blockHash: "0x2a",
        blockNumber: 1,
        transactionHash: "0xffff1a",
        gasUsed: 100000,
        logs: []
      }
    };

    this.blocks = [
      {
        number: 0,
        hash: "0x1a",
        parentHash: "",
        timestamp: 100000,
        transactions: []
      },
      {
        number: 1,
        hash: "0x2a",
        parentHash: "0x1a",
        timestamp: 100000,
        transactions: [
          new MockTransaction()
        ]
      },
      {
        number: 2,
        hash: "0x3a",
        parentHash: "0x2a",
        timestamp: 100000,
        transactions: []
      }
    ];

    this.balances = {
      "0x1234": BigNumberHelper.toBigNumber("9900000")
    };
  }

  contract(abi: any[]) {
    return {};
  }

  getBlock(hash: number | string, inclTransactions: boolean, cb: (err?: Error, b?: Block) => void): void {
    if (typeof hash === "number") {
      cb(undefined, this.blocks[hash]);
    } else {
      if (hash === "latest") {
        cb(undefined, this.blocks[this.blocks.length - 1]);
      } else {
        const foundBlock = this.blocks.find((b) => { return b.hash === hash; });
        if (foundBlock) {
          cb(undefined, foundBlock);
        } else {
          cb(new Error(`Block ${hash} not found!`), undefined);
        }
      }
    }
  }

  getTransactionReceipt(hash: string, cb: (err?: Error, b?: TransactionReceipt) => void): void {
    if (this.transactionReceipts[hash]) {
      cb(undefined, this.transactionReceipts[hash]);
    } else {
      cb(new Error(`Transaction ${hash} not found!`), undefined);
    }
  }

  getBalance(address: string, cb: ((err?: Error, b?: BigNumber) => void)): void;
  getBalance(address: string, block: number | string, cb: (err?: Error, b?: BigNumber) => void): void;
  getBalance(address: string,
             blockOrCb: number | string | ((err?: Error, b?: BigNumber) => void),
             cb?: ((err?: Error, b?: BigNumber) => void)): void {
    let callback: (err?: Error, b?: BigNumber) => void;
    if (typeof blockOrCb === "function") {
      callback = blockOrCb;
    } else if (cb && typeof cb === "function") {
      callback = cb;
    } else {
      throw new Error("Missing callback!");
    }

    const balance = this.balances[address];
    if (balance) {
      callback(undefined, balance);
    } else {
      callback(new Error(`Address ${address} not found!`), undefined);
    }
  }
}
