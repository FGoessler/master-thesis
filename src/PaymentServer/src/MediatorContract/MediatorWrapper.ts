import { EthAddress } from "../services/PersistenceService";
import { BigNumber } from "../util/BigNumberHelper";
import TransactionValidator from "./TransactionValidator";
import { TimeLimitedCache } from "../util/TimeLimitedCache";
import { EthereumCommunicationError } from "../errors";
const util = require("util");
const ethUtil = require("ethereumjs-util");
const sig = require("../util/signatureHelper");

export interface TransactionsInProgressState {
  tokenRedemptionInitialization: boolean;
  tokenRedemptionFinalization: boolean;
  terminationFinalization: boolean;
  depositFunds: boolean;
}

export interface Mediator {
  mediatorAddress: EthAddress;
  transactionsInProgress: TransactionsInProgressState;

  depositFunds(serviceConsumer: EthAddress, amount: BigNumber): Promise<void>;
  getServiceConsumer(): Promise<EthAddress>;
  getServiceProvider(): Promise<EthAddress>;
  getServiceConsumerFunds(): Promise<BigNumber>;
  getServiceProviderFunds(): Promise<BigNumber>;

  getTokenRedemptionTimeout(): Promise<BigNumber>;
  getCostPerRequest(): Promise<BigNumber>;

  getActiveTokenId(): Promise<BigNumber>;
  getSoonExpiringTokenId(): Promise<BigNumber>;
  getSoonExpiringTokenIdTimeout(): Promise<BigNumber>;

  startTokenRedemption(serviceProvider: EthAddress, newTokenId: BigNumber): Promise<void>;
  redeemToken(serviceProvider: EthAddress, serviceConsumer: EthAddress, tokenId: BigNumber, numRequests: number, signature: string): Promise<void>;
  payout(serviceProvider: EthAddress): Promise<void>;

  getTerminationStartedAt(): Promise<BigNumber>;
  getTerminationTimeout(): Promise<BigNumber>;
  getTerminated(): Promise<boolean>;

  terminateByProvider(serviceProvider: EthAddress): Promise<void>;
  startTerminationByConsumer(serviceConsumer: EthAddress): Promise<void>;
  finalizeTerminationByConsumer(serviceConsumer: EthAddress): Promise<void>;

}


export class MediatorWrapper implements Mediator {

  public mediatorAddress: EthAddress;
  public transactionsInProgress: TransactionsInProgressState;
  private transactionValidator: TransactionValidator;
  private mediatorContract: any;
  private cache: TimeLimitedCache;

  constructor(mediatorAddress: EthAddress, transactionValidator: TransactionValidator, mediatorContract: any) {
    this.mediatorAddress = mediatorAddress;
    this.transactionValidator = transactionValidator;
    this.mediatorContract = mediatorContract;
    this.cache = new TimeLimitedCache();
    this.transactionsInProgress = {
      tokenRedemptionInitialization: false,
      tokenRedemptionFinalization: false,
      terminationFinalization: false,
      depositFunds: false
    };
  }

  depositFunds(serviceConsumer: EthAddress, amount: BigNumber): Promise<void> {
    this.transactionsInProgress.depositFunds = true;
    return util.promisify(this.mediatorContract.depositForServiceConsumer.sendTransaction)({
        from: serviceConsumer,
        value: amount,
        gas: 200000
      })
      .catch((err: Error) => {
        throw new EthereumCommunicationError(err, "depositFunds");
      })
      .then((transactionId: string) => this.transactionValidator.checkTransactionCompleted(transactionId))
      .then(() => this.transactionsInProgress.depositFunds = false)
      .catch((err: Error) => {
        this.transactionsInProgress.depositFunds = false;
        throw err;
      });
  }

  getServiceConsumer(): Promise<EthAddress> {
    return this.getValueWithCaching<EthAddress>("serviceConsumer");
  }

  getServiceProvider(): Promise<EthAddress> {
    return this.getValueWithCaching<EthAddress>("serviceProvider");
  }

  getServiceConsumerFunds(): Promise<BigNumber> {
    return this.getValueWithCaching<BigNumber>("serviceConsumerFunds", async () => {
      const timeout = await this.getTokenRedemptionTimeout();
      return timeout.toNumber() * 1000 / 2;
    });
  }

  getServiceProviderFunds(): Promise<BigNumber> {
    return util.promisify(this.mediatorContract.serviceProviderFunds.call)()
      .catch((err: Error) => {
        throw new EthereumCommunicationError(err, "getServiceProviderFunds");
      });
  }

  getTokenRedemptionTimeout(): Promise<BigNumber> {
    return this.getValueWithCaching<BigNumber>("tokenRedemptionTimeout");
  }

  getCostPerRequest(): Promise<BigNumber> {
    return this.getValueWithCaching<BigNumber>("costPerRequest");
  }

  getActiveTokenId(): Promise<BigNumber> {
    return this.getValueWithCaching<BigNumber>("activeTokenId", async () => {
      const timeout = await this.getTokenRedemptionTimeout();
      return timeout.toNumber() * 1000 / 2;
    });
  }

  getSoonExpiringTokenId(): Promise<BigNumber> {
    return util.promisify(this.mediatorContract.soonExpiringTokenId.call)()
      .catch((err: Error) => {
        throw new EthereumCommunicationError(err, "getSoonExpiringTokenId");
      });
  }

  getSoonExpiringTokenIdTimeout(): Promise<BigNumber> {
    return util.promisify(this.mediatorContract.soonExpiringTokenIdTimeout.call)()
      .catch((err: Error) => {
        throw new EthereumCommunicationError(err, "getSoonExpiringTokenIdTimeout");
      });
  }

  startTokenRedemption(serviceProvider: EthAddress, newTokenId: BigNumber): Promise<void> {
    this.transactionsInProgress.tokenRedemptionInitialization = true;
    return util.promisify(this.mediatorContract.startTokenRedemption.sendTransaction)(newTokenId.toString(10), {
        from: serviceProvider,
        gas: 200000
      })
      .catch((err: Error) => {
        throw new EthereumCommunicationError(err, "startTokenRedemption");
      })
      .then((transactionId: string) => this.transactionValidator.checkTransactionCompleted(transactionId))
      .then(() => this.transactionsInProgress.tokenRedemptionInitialization = false)
      .catch((err: Error) => {
        this.transactionsInProgress.tokenRedemptionInitialization = false;
        throw err;
      });
  }

  redeemToken(serviceProvider: EthAddress, serviceConsumer: EthAddress, tokenId: BigNumber, numRequests: number, signature: string) {
    const payloadHash = sig.solidityHash(
      ["address", "uint", "address", "uint"],
      [ethUtil.toBuffer(serviceConsumer), tokenId.toString(10), ethUtil.toBuffer(this.mediatorContract.address), numRequests]
    );

    const r = ethUtil.toBuffer(signature.slice(0, 66));
    const s = ethUtil.toBuffer("0x" + signature.slice(66, 130));
    const v = ethUtil.bufferToInt(ethUtil.toBuffer("0x" + signature.slice(130, 132))) + 27;

    this.transactionsInProgress.tokenRedemptionFinalization = true;
    return util.promisify(this.mediatorContract.redeemToken.sendTransaction)
      (numRequests, ethUtil.bufferToHex(payloadHash), v, ethUtil.bufferToHex(r), ethUtil.bufferToHex(s), {
        from: serviceProvider,
        gas: 200000
      })
      .catch((err: Error) => {
        throw new EthereumCommunicationError(err, "redeemToken");
      })
      .then((transactionId: string) => this.transactionValidator.checkTransactionCompleted(transactionId))
      .then(() => this.transactionsInProgress.tokenRedemptionFinalization = false)
      .catch((err: Error) => {
        this.transactionsInProgress.tokenRedemptionFinalization = false;
        throw err;
      });
  }

  payout(serviceProvider: EthAddress): Promise<void> {
    return util.promisify(this.mediatorContract.payoutForServiceProvider.sendTransaction)({
      from: serviceProvider,
      gas: 200000
    })
      .catch((err: Error) => {
        throw new EthereumCommunicationError(err, "payout");
      })
      .then((transactionId: string) => this.transactionValidator.checkTransactionCompleted(transactionId));
  }

  getTerminationStartedAt(): Promise<BigNumber> {
    return util.promisify(this.mediatorContract.terminationStartedAt.call)()
      .catch((err: Error) => {
        throw new EthereumCommunicationError(err, "getTerminationStartedAt");
      });
  }

  getTerminationTimeout(): Promise<BigNumber> {
    return this.getValueWithCaching<BigNumber>("terminationTimeout");
  }

  getTerminated(): Promise<boolean> {
    return this.getValueWithCaching<boolean>("terminated", async () => {
      const timeout = await this.getTerminationTimeout();
      return timeout.toNumber() * 1000 / 4;
    });
  }

  terminateByProvider(serviceProvider: EthAddress): Promise<void> {
    this.transactionsInProgress.terminationFinalization = true;
    return util.promisify(this.mediatorContract.closeThroughServiceProvider.sendTransaction)({
        from: serviceProvider,
        gas: 200000
      })
      .catch((err: Error) => {
        throw new EthereumCommunicationError(err, "terminateByProvider");
      })
      .then((transactionId: string) => this.transactionValidator.checkTransactionCompleted(transactionId))
      .then(() => this.transactionsInProgress.tokenRedemptionInitialization = false)
      .catch((err: Error) => {
        this.transactionsInProgress.tokenRedemptionInitialization = false;
        throw err;
      });
  }

  startTerminationByConsumer(serviceConsumer: EthAddress): Promise<void> {
    return util.promisify(this.mediatorContract.startCloseThroughServiceConsumer.sendTransaction)({
        from: serviceConsumer,
        gas: 200000
      })
      .catch((err: Error) => {
        throw new EthereumCommunicationError(err, "startTerminationByConsumer");
      })
      .then((transactionId: string) => this.transactionValidator.checkTransactionCompleted(transactionId));
  }

  finalizeTerminationByConsumer(serviceConsumer: EthAddress): Promise<void> {
    this.transactionsInProgress.terminationFinalization = true;
    return util.promisify(this.mediatorContract.finalizeCloseThroughServiceConsumer.sendTransaction)({
        from: serviceConsumer,
        gas: 200000
      })
      .catch((err: Error) => {
        throw new EthereumCommunicationError(err, "finalizeTerminationByConsumer");
      })
      .then((transactionId: string) => this.transactionValidator.checkTransactionCompleted(transactionId))
      .then(() => this.transactionsInProgress.terminationFinalization = false)
      .catch((err: Error) => {
        this.transactionsInProgress.terminationFinalization = false;
        throw err;
      });
  }

  private async getValueWithCaching<T>(id: string, cacheDurationCalculator?: () => Promise<number>): Promise<T> {
    return this.cache.getValueWithOptimisticUpdates<T>(
      id,
      () => { return util.promisify(this.mediatorContract[id].call)(); },
      cacheDurationCalculator
    );
  }
}
