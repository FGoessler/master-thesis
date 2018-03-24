import { MediatorListService } from "../services/MediatorListService";
import { MediatorProvider } from "../services/MediatorProvider";
import TokenRedemptionService from "../services/TokenRedemptionService";
import { FundingService } from "../services/FundingService";
import { Mediator } from "../MediatorContract/MediatorWrapper";

const intervalPeriod = 2; // in sec

export default class TimerService {
  private mediatorListService: MediatorListService;
  private mediatorProviderService: MediatorProvider;
  private tokenRedemptionService: TokenRedemptionService;
  private fundingService: FundingService;

  constructor(_mediatorListService: MediatorListService, _mediatorProviderService: MediatorProvider, _tokenRedemptionService: TokenRedemptionService, _fundingService: FundingService) {
    this.mediatorListService = _mediatorListService;
    this.mediatorProviderService = _mediatorProviderService;
    this.tokenRedemptionService = _tokenRedemptionService;
    this.fundingService = _fundingService;
  }

  startIntervalTimer() {
    setInterval(() => {
      (async () => {
        const providerMediatorAddresses = await this.mediatorListService.getAllKnownProviderMediatorAddresses();
        for (const address of providerMediatorAddresses) {
          const mediatorWrapper = this.mediatorProviderService.getMediatorWrapperWithAddress(address);
          Promise.all([
            this.tokenRedemptionService.checkTokenRedemptionTimeout(mediatorWrapper),
            this.tokenRedemptionService.startTokenRedemptionIfTerminationStarted(mediatorWrapper),
            this.tokenRedemptionService.periodicRedeemTokenCheck(mediatorWrapper),
            this.removeIfTerminated(mediatorWrapper)
          ]).catch((err) => console.error(err));
        }

        const consumerMediatorAddresses = await this.mediatorListService.getAllKnownConsumerMediatorAddresses();
        for (const address of consumerMediatorAddresses) {
          const mediatorWrapper = this.mediatorProviderService.getMediatorWrapperWithAddress(address);
          Promise.all([
            this.finalizeTerminationIfPossible(mediatorWrapper),
            this.fundingService.checkForAutoRefunding(mediatorWrapper),
            this.removeIfTerminated(mediatorWrapper)
          ]).catch((err) => console.error(err));
        }
      })().catch((err) => {
        console.error(err);
      });
    }, intervalPeriod * 1000);
  }

  async removeIfTerminated(mediatorWrapper: Mediator) {
    if (await mediatorWrapper.getTerminated()) {
      await this.mediatorListService.removeMediatorAddressBecauseOfTermination(mediatorWrapper.mediatorAddress);
    }
  }

  async finalizeTerminationIfPossible(mediatorWrapper: Mediator) {
    const terminationStartedAt = (await mediatorWrapper.getTerminationStartedAt()).toNumber();
    if (terminationStartedAt > 0) {
      const terminationTimeout = (await mediatorWrapper.getTerminationTimeout()).toNumber();
      if (
        terminationStartedAt + terminationTimeout >= Date.now() / 1000 &&
        !mediatorWrapper.transactionsInProgress.terminationFinalization
      ) {
        const serviceConsumer = await mediatorWrapper.getServiceConsumer();
        await mediatorWrapper.finalizeTerminationByConsumer(serviceConsumer);
      }
    }
  }

}
