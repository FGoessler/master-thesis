import { MediatorListService } from "../services/MediatorListService";
import { MediatorProvider } from "../services/MediatorProvider";
import { TokenStoreService } from "../services/TokenStoreService";
import { Request, Response } from "express";
import { EthAddress } from "../services/PersistenceService";
import { BigNumberHelper, BigNumber } from "../util/BigNumberHelper";
import { Mediator } from "../MediatorContract/MediatorWrapper";
import {
  InvalidTokenIDError, InvalidRequestCountError, MediatorSettingsNotMatchingProviderRequirementsError,
  MediatorTerminatedError, SignatureInvalidError
} from "../errors";
import { beNonEmptyString, beNumber, beObject } from "../util/preconditions";
const AsyncLock = require("async-lock");
const sig = require("../util/signatureHelper");
const ethUtil = require("ethereumjs-util");

export class ValidateTokenEndpoint {

  private mediatorListService: MediatorListService;
  private mediatorProvider: MediatorProvider;
  private tokenStoreService: TokenStoreService;
  private lock: any;

  constructor(_mediatorListService: MediatorListService, _mediatorProvider: MediatorProvider, _tokenStoreService: TokenStoreService) {
    this.mediatorListService = _mediatorListService;
    this.mediatorProvider = _mediatorProvider;
    this.tokenStoreService = _tokenStoreService;
    this.lock = new AsyncLock();
  }

  async handle(req: Request, res: Response) {
    const launchTime = parseInt(req.header("x-launch-time") || "0");
    console.warn("VALIDATE_REQUEST_WAITED " + (new Date().getTime() - launchTime) + "ms");
    const id = Math.random();
    console.time("VALIDATE_REQUEST_DURATION_" + id);

    const senderAddress = beNonEmptyString(req.query.sender);
    const mediatorAddress = beNonEmptyString(req.query.mediator);
    const signature = beNonEmptyString(req.query.signature);
    const tokenId = beObject(BigNumberHelper.toBigNumber(req.query.tokenId));
    const reqCount = beNumber(parseInt(req.query.reqCount));

    const expectedMinCostPerRequest = beObject(BigNumberHelper.toBigNumber(req.query.minCostPerRequest));
    const expectedTerminationTimeout = beNumber(parseInt(req.query.terminationTimeout));
    const expectedTokenRedemptionTimeout = beNumber(parseInt(req.query.tokenRedemptionTimeout));

    console.time("VALIDATE_REQUEST_PLAIN_SIG_CHECK_DURATION_" + id);
    this._checkSignature(mediatorAddress, senderAddress, tokenId, reqCount, signature);
    console.timeEnd("VALIDATE_REQUEST_PLAIN_SIG_CHECK_DURATION_" + id);

    const mediatorWrapper = this.mediatorProvider.getMediatorWrapperWithAddress(mediatorAddress);

    await(this._checkTerminationStatus(mediatorWrapper));
    await this._checkContractConditions(mediatorWrapper, expectedMinCostPerRequest, expectedTerminationTimeout, expectedTokenRedemptionTimeout);
    await this._checkTokenId(mediatorWrapper, tokenId);
    await this._checkFunds(mediatorWrapper, reqCount);

    await this._checkRequestCounter(mediatorAddress, tokenId, reqCount, signature);

    await this.mediatorListService.addMediatorAddressOnBehalfOfServiceProvider(mediatorAddress);

    res.json({valid: true});
    console.timeEnd("VALIDATE_REQUEST_DURATION_" + id);
  }

  _checkSignature(mediatorAddress: EthAddress, senderAddress: EthAddress, tokenId: BigNumber, reqCount: number, signature: string): void {
    const hash = sig.solidityHash(
      ["address", "uint", "address", "uint"],
      [ethUtil.toBuffer(senderAddress), tokenId.toString(10), ethUtil.toBuffer(mediatorAddress), reqCount]
    );
    if (!sig.verifySignature(hash, signature, senderAddress)) {
      throw new SignatureInvalidError();
    }
  }

  async _checkRequestCounter(mediatorAddress: EthAddress, tokenId: BigNumber, reqCount: number, signature: string): Promise<void> {
    // This is an async multiple step process - getting current id, checking it and writing the new one back.
    // No other validation request should interfere with this to avoid a double spend.
    // => Using a lock on the mediator & token id.
    await this.lock.acquire("check" + mediatorAddress + tokenId.toString(10), async () => {
      const requestCounter = await this.tokenStoreService.getProviderRequestCounterInfoForMediator(mediatorAddress, tokenId);
      if (!requestCounter.isCountValid(reqCount)) {
        throw new InvalidRequestCountError(requestCounter.highestCount);
      }
      await this.tokenStoreService.saveNewRequestCountAndSignatureForProvider(mediatorAddress, tokenId, reqCount, signature);
    });
  }

  async _checkTerminationStatus(mediator: Mediator): Promise<void> {
    if (await mediator.getTerminated()) {
      throw new MediatorTerminatedError(mediator.mediatorAddress);
    }
    return Promise.resolve();
  }

  async _checkContractConditions(mediator: Mediator, expectedMinCostPerRequest: BigNumber, expectedTerminationTimeout: number, expectedTokenRedemptionTimeout: number): Promise<void> {
    const mediatorTerminationTimeout = (await mediator.getTerminationTimeout()).toNumber();
    const mediatorCostPerRequest = await mediator.getCostPerRequest();
    const mediatorTokenRedemptionTimeout = (await mediator.getTokenRedemptionTimeout()).toNumber();

    const conditionsOK =
      mediatorCostPerRequest.greaterThanOrEqualTo(expectedMinCostPerRequest) &&
      mediatorTerminationTimeout === expectedTerminationTimeout &&
      mediatorTokenRedemptionTimeout === expectedTokenRedemptionTimeout;

    if (!conditionsOK) {
      return Promise.reject(new MediatorSettingsNotMatchingProviderRequirementsError());
    } else {
      return Promise.resolve();
    }
  }

  async _checkTokenId(mediator: Mediator, tokenIdToCheck: BigNumber): Promise<void> {
    let id = await mediator.getActiveTokenId();
    if (id.toString(10) === "0") {
      // Last token was already redeemed - no new token available after termination started
      throw new MediatorTerminatedError(mediator.mediatorAddress);
    }
    if (tokenIdToCheck.toString(10) === id.toString(10)) {
      return Promise.resolve();
    } else {
      id = await mediator.getSoonExpiringTokenId();
      if (tokenIdToCheck.toString(10) === id.toString(10)) {
        const timeout = await mediator.getSoonExpiringTokenIdTimeout();
        if (timeout.toNumber() > Date.now() / 1000) {
          return Promise.resolve();
        }
        throw new InvalidTokenIDError(tokenIdToCheck.toString(10));
      }
    }
  }

  async _checkFunds(mediator: Mediator, reqCount: number, minFundingBuffer: BigNumber = BigNumberHelper.toBigNumber(0)): Promise<void> {
    const costPerRequest = await mediator.getCostPerRequest();
    const totalValueOfToken = costPerRequest.times(reqCount);

    const consumerFunds = await mediator.getServiceConsumerFunds();
    const remainder = consumerFunds.minus(totalValueOfToken);
    if (remainder.lessThan(minFundingBuffer)) {
      throw new Error(`Consumer does not have enough funds in the mediator. Funds: ${consumerFunds.toString(10)} - TokenValue: ${totalValueOfToken.toString(10)} - Remainder: ${remainder.toString(10)}. Requiring buffer of at least ${minFundingBuffer.toString(10)} wei.`);
    }

    return Promise.resolve();
  }
}
