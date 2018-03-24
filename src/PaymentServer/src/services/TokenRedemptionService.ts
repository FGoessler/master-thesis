import { TokenStoreService } from "../services/TokenStoreService";
import TokenIdGenerator from "../services/TokenIdGenerator";
import { Mediator } from "../MediatorContract/MediatorWrapper";
import { InvalidRequestCountError, SignatureInvalidError } from "../errors";
const _ = require("lodash");

const tokenAutoRedeemAge = 3600; // in sec

export default class TokenRedemptionService {
  private tokenStoreService: TokenStoreService;
  private tokenIdGenerator: TokenIdGenerator;

  constructor(_tokenStoreService: TokenStoreService, _tokenIdGenerator: TokenIdGenerator) {
    this.tokenStoreService = _tokenStoreService;
    this.tokenIdGenerator = _tokenIdGenerator;
  }

  async startTokenRedemptionIfTerminationStarted(mediatorWrapper: Mediator) {
    const terminationStartedAt = (await mediatorWrapper.getTerminationStartedAt()).toNumber();
    if (terminationStartedAt === 0) {
      return;
    }

    const soonExpiringTokenIdTimeout = (await mediatorWrapper.getSoonExpiringTokenIdTimeout()).toNumber();
    if (soonExpiringTokenIdTimeout > 0) {
      return;
    }

    const serviceProvider = await mediatorWrapper.getServiceProvider();

    if (mediatorWrapper.transactionsInProgress.tokenRedemptionInitialization) {
      return;
    }

    await mediatorWrapper.startTokenRedemption(serviceProvider, this.tokenIdGenerator.createRandomTokenId());
  }

  async checkTokenRedemptionTimeout(mediatorWrapper: Mediator) {
    const soonExpiringTokenIdTimeout = (await mediatorWrapper.getSoonExpiringTokenIdTimeout()).toNumber();
    if (soonExpiringTokenIdTimeout === 0 || soonExpiringTokenIdTimeout > Date.now() / 1000) {
      return;
    }

    const tokenId = (await mediatorWrapper.getSoonExpiringTokenId());

    const reqCounterInfo = await this.tokenStoreService.getProviderRequestCounterInfoForMediator(mediatorWrapper.mediatorAddress, tokenId);
    const reqCount = reqCounterInfo.highestCount;
    const signature = reqCounterInfo.signature;

    if (isNaN(reqCount) || reqCount < 0) {
      throw new InvalidRequestCountError(reqCount);
    }

    if (!_.isString(signature)) {
      throw new SignatureInvalidError();
    }

    const serviceConsumer = await mediatorWrapper.getServiceConsumer();
    const serviceProvider = await mediatorWrapper.getServiceProvider();

    if (mediatorWrapper.transactionsInProgress.tokenRedemptionFinalization) {
      return;
    }

    await mediatorWrapper.redeemToken(serviceProvider, serviceConsumer, tokenId, reqCount, signature as string);
    await mediatorWrapper.payout(serviceProvider);
  }

  async periodicRedeemTokenCheck(mediatorWrapper: Mediator) {
    const activeTokenId = (await mediatorWrapper.getActiveTokenId());
    const info = await this.tokenStoreService.getProviderRequestCounterInfoForMediator(mediatorWrapper.mediatorAddress, activeTokenId);
    const tokenAge = Date.now() / 1000 - (info.knownSince || (Date.now() / 1000));
    if (tokenAge >= tokenAutoRedeemAge && !mediatorWrapper.transactionsInProgress.tokenRedemptionInitialization) {
      const serviceProvider = await mediatorWrapper.getServiceProvider();
      await mediatorWrapper.startTokenRedemption(serviceProvider, this.tokenIdGenerator.createRandomTokenId());
    }
  }
}
