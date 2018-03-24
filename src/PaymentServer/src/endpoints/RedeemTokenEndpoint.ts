import { Request, Response } from "express";
import { MediatorProvider } from "../services/MediatorProvider";
import TokenIdGenerator from "../services/TokenIdGenerator";
import { TokenRedemptionInProgressError } from "../errors";
import { beNonEmptyString } from "../util/preconditions";

export default class RedeemTokenEndpoint {
  private mediatorProvider: MediatorProvider;
  private tokenIdGenerator: TokenIdGenerator;

  constructor(_mediatorProvider: MediatorProvider, _tokenIdGenerator: TokenIdGenerator) {
    this.mediatorProvider = _mediatorProvider;
    this.tokenIdGenerator = _tokenIdGenerator;
  }

  async handle(req: Request, res: Response) {
    const senderAddress = beNonEmptyString(req.header("x-pay-sender"));
    const mediatorAddress = req.params.mediatorAddress;

    const mediatorWrapper = this.mediatorProvider.getMediatorWrapperWithAddress(mediatorAddress);

    const soonExpiringTokenId = (await mediatorWrapper.getSoonExpiringTokenId()).toString(10);
    if (soonExpiringTokenId !== "0") {
      throw new TokenRedemptionInProgressError();
    }

    await mediatorWrapper.startTokenRedemption(senderAddress, this.tokenIdGenerator.createRandomTokenId());

    res.json({started: true});
  }
}
