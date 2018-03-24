import { BigNumber } from "./bigNumber";

export interface Block {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  transactions: (string | Transaction)[];
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: BigNumber;
  input?: string;
  transactionReceipt?: TransactionReceipt;
  isContractDeployment?: boolean;
}

export function isTransaction(t: string | Transaction): t is Transaction {
  return (<Transaction> t).hash !== undefined;
}

export interface TransactionReceipt {
  blockHash: string;
  blockNumber: number;
  transactionHash: string;
  contractAddress?: string;
  gasUsed: number;
  logs: any[];
}

export interface Web3 {
  eth: Eth;
}

export interface Eth {
  contract(abi: any[]): any;
  getBlock(hash: number | string, inclTransactions: boolean, cb: (err?: Error, b?: Block) => void): void;
  getTransactionReceipt(hash: string, cb: (err?: Error, b?: TransactionReceipt) => void): void;
  getBalance(address: string, cb: (err?: Error, b?: BigNumber) => void): void;
  getBalance(address: string, block: number | string | undefined, cb: (err?: Error, b?: BigNumber) => void): void;
}
