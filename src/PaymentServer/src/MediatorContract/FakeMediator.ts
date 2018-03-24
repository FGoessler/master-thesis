import { Mediator, TransactionsInProgressState } from "./MediatorWrapper";
import { EthAddress } from "../services/PersistenceService";
import { BigNumberHelper, BigNumber } from "../util/BigNumberHelper";

export class FakeMediator implements Mediator {

  public mediatorAddress: EthAddress = "0x1";
  public transactionsInProgress: TransactionsInProgressState = {
    tokenRedemptionInitialization: false,
    tokenRedemptionFinalization: false,
    terminationFinalization: false,
    depositFunds: false
  };
  public consumer: EthAddress = "0x1000";
  public provider: EthAddress = "0x2000";
  public consumerFunds: BigNumber = BigNumberHelper.toBigNumber(5000);
  public providerFunds: BigNumber = BigNumberHelper.toBigNumber(0);
  public tokenRedemptionTimeout: BigNumber = BigNumberHelper.toBigNumber(30);
  public costPerRequest: BigNumber = BigNumberHelper.toBigNumber(10);
  public activeTokenId: BigNumber = BigNumberHelper.toBigNumber(1);
  public soonExpiringTokenId: BigNumber = BigNumberHelper.toBigNumber(0);
  public soonExpiringTokenIdTimeout: BigNumber = BigNumberHelper.toBigNumber(0);
  public terminationStartedAt: BigNumber = BigNumberHelper.toBigNumber(0);
  public terminationTimeout: BigNumber = BigNumberHelper.toBigNumber(60);
  public terminated: boolean = false;

  depositFunds(serviceConsumer: EthAddress, amount: BigNumber): Promise<void> {
    return Promise.resolve();
  }
  async getServiceConsumer(): Promise<EthAddress> {
    return this.consumer;
  }
  async getServiceProvider(): Promise<EthAddress> {
    return this.provider;
  }
  async getServiceConsumerFunds(): Promise<BigNumber> {
    return this.consumerFunds;
  }
  async getServiceProviderFunds(): Promise<BigNumber> {
    return this.providerFunds;
  }

  async getTokenRedemptionTimeout(): Promise<BigNumber> {
    return this.tokenRedemptionTimeout;
  }
  async getCostPerRequest(): Promise<BigNumber> {
    return this.costPerRequest;
  }

  async getActiveTokenId(): Promise<BigNumber> {
    return this.activeTokenId;
  }
  async getSoonExpiringTokenId(): Promise<BigNumber> {
    return this.soonExpiringTokenId;
  }
  async getSoonExpiringTokenIdTimeout(): Promise<BigNumber> {
    return this.soonExpiringTokenIdTimeout;
  }

  startTokenRedemption(serviceProvider: EthAddress, newTokenId: BigNumber): Promise<void> {
    return Promise.resolve();
  }
  redeemToken(serviceProvider: EthAddress, serviceConsumer: EthAddress, tokenId: BigNumber, numRequests: number, signature: string): Promise<void> {
    return Promise.resolve();
  }
  payout(serviceProvider: EthAddress): Promise<void> {
    return Promise.resolve();
  }

  async getTerminationStartedAt(): Promise<BigNumber> {
    return this.terminationStartedAt;
  }
  async getTerminationTimeout(): Promise<BigNumber> {
    return this.terminationTimeout;
  }
  async getTerminated(): Promise<boolean> {
    return this.terminated;
  }

  terminateByProvider(serviceProvider: EthAddress): Promise<void> {
    return Promise.resolve();
  }
  startTerminationByConsumer(serviceConsumer: EthAddress): Promise<void> {
    return Promise.resolve();
  }
  finalizeTerminationByConsumer(serviceConsumer: EthAddress): Promise<void> {
    return Promise.resolve();
  }

}
