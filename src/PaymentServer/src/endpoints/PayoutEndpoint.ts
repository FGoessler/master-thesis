import { Request, Response } from "express";
import { MediatorProvider } from "../services/MediatorProvider";
import { beNonEmptyString } from "../util/preconditions";

export default class PayoutEndpoint {
  private mediatorProvider: MediatorProvider;

  constructor(_mediatorProvider: MediatorProvider) {
    this.mediatorProvider = _mediatorProvider;
  }

  async handle(req: Request, res: Response) {
    const senderAddress: string = beNonEmptyString(req.header("x-pay-sender"));
    const mediatorAddress = req.params.mediatorAddress;

    const mediatorWrapper = this.mediatorProvider.getMediatorWrapperWithAddress(mediatorAddress);
    await mediatorWrapper.payout(senderAddress);
    res.json({});
  }
}
