import MediatorCompiler from "./MediatorCompiler";
import Logger from "../util/Logger";
import { getErrorForCode, TransactionValidationError, UnknownError } from "../errors";
const parseLogs = require("./logParser");
const config = require("../config.json");

const transactionRetryInterval = config.mediator.transactionRetryInterval;
const transactionMaxRetryCount = config.mediator.transactionMaxRetryCount;

export default class TransactionValidator {

  private web3: any;
  private abi?: any;
  private mediatorCompiler: MediatorCompiler;

  constructor(web3: any, mediatorCompiler: MediatorCompiler) {
    this.web3 = web3;
    this.mediatorCompiler = mediatorCompiler;
  }

  private getErrorFromReceiptIfAny(receipt: any, transactionId: string): Error | undefined {
    let error = undefined;
    if (!this.abi) {
      this.abi = JSON.parse(this.mediatorCompiler.getCompiledContract().interface);
    }
    const logs = parseLogs(receipt.logs, this.abi);
    const errors = logs.filter((log: any) => {
      return log.transactionHash === transactionId && log.event === "Error";
    });
    if (errors.length > 0) {
      const errorCode = errors[0].args.code.toNumber();
      if (errorCode) {
        error = getErrorForCode(errorCode);
      }
      if (!error) {
        error = new UnknownError(errorCode, undefined);
      }
    }
    return error;
  }

  private checkTransaction(transactionId: string, retriesRemaining: number, completion: (e?: Error) => void): void {
    this.web3.eth.getTransactionReceipt(transactionId, (err: Error | undefined, receipt: object) => {
      if ((err || !receipt) && retriesRemaining > 0) {
        setTimeout(() => {
          this.checkTransaction(transactionId, retriesRemaining - 1, completion);
        }, transactionRetryInterval * 1000);
        return;
      }

      if (err) {
        completion(new TransactionValidationError(err));
      } else if (!receipt) {
        completion(new TransactionValidationError(new Error("No receipt for transaction available. Transaction probably not confirmed.")));
      } else {
        completion(this.getErrorFromReceiptIfAny(receipt, transactionId));
      }
    });
  }

  /**
   * Checks if there's an transaction receipt for the given Id and whether the transaction was executed successfully.
   */
  public checkTransactionCompleted(transactionId: string): Promise<void> {
    Logger.log(`Waiting for Transaction completion: ${transactionId}`);
    return new Promise<void>((resolve, reject) => {
      this.checkTransaction(transactionId, transactionMaxRetryCount, (err?: Error) => {
        if (err) {
          Logger.error(`Transaction failed! ${transactionId} - ${err}`);
          reject(err);
        } else {
          Logger.log(`Transaction completed. ${transactionId}`);
          resolve();
        }
      });
    });
  }

}
