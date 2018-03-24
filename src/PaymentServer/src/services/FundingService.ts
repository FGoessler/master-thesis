import { EthAddress, PersistenceService } from "./PersistenceService";
import { Mediator } from "../MediatorContract/MediatorWrapper";
import { BigNumberHelper, BigNumber } from "../util/BigNumberHelper";
import { beNonEmptyString, beObject } from "../util/preconditions";

interface FundingConfig {
  refundingAmount: string;
  autoRefundingThreshold: string;
}

export class FundingService {
  private store: PersistenceService;

  constructor(_store: PersistenceService) {
    this.store = _store;
  }

  async saveFundingParametersForMediator(mediatorAddress: EthAddress, refundingAmount: BigNumber, autoRefundingThreshold: BigNumber): Promise<void> {
    beNonEmptyString(mediatorAddress);
    beObject(refundingAmount);

    const data: FundingConfig = {
      refundingAmount: refundingAmount.toString(10),
      autoRefundingThreshold: autoRefundingThreshold.toString(10)
    };
    await this.store.store("fundingConfigsPerMediator", mediatorAddress, data);
  }

  async checkForAutoRefunding(mediatorWrapper: Mediator): Promise<void> {
    const fundingConfig = await this.store.load("fundingConfigsPerMediator", mediatorWrapper.mediatorAddress) as FundingConfig;
    if (!fundingConfig || !fundingConfig.autoRefundingThreshold) {
      return;
    }

    const consumerFunds = await mediatorWrapper.getServiceConsumerFunds();
    if (
      consumerFunds.lessThan(BigNumberHelper.toBigNumber(fundingConfig.autoRefundingThreshold)) &&
      !mediatorWrapper.transactionsInProgress.depositFunds
    ) {
      const serviceConsumer = await mediatorWrapper.getServiceConsumer();
      const refundingAmount = BigNumberHelper.toBigNumber(fundingConfig.refundingAmount);
      await mediatorWrapper.depositFunds(serviceConsumer, refundingAmount);
    }
  }
}
