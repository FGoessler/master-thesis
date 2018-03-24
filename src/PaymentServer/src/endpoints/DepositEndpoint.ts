import { Request, Response } from "express";
import { MediatorProvider } from "../services/MediatorProvider";
import { FundingService } from "../services/FundingService";
import { DepositError } from "../errors";
import { beNonEmptyString } from "../util/preconditions";

export default class DepositEndpoint {
  private mediatorProvider: MediatorProvider;
  private fundingService: FundingService;
  private web3: any;

  constructor(_mediatorProvider: MediatorProvider, _fundingService: FundingService, _web3: any) {
    this.mediatorProvider = _mediatorProvider;
    this.fundingService = _fundingService;
    this.web3 = _web3;
  }

  async handle(req: Request, res: Response) {
    const senderAddress = beNonEmptyString(req.header("x-pay-sender"));
    const mediatorAddress = beNonEmptyString(req.params.mediatorAddress);
    const amount = this.web3.toBigNumber(req.params.amount);
    const autoFundingThreshold = this.web3.toBigNumber(req.query.autoFundingThreshold);

    if (!amount || amount.lessThanOrEqualTo(0)) {
      throw new DepositError(new Error("Invalid amount!"));
    }

    await this.fundingService.saveFundingParametersForMediator(mediatorAddress, amount, autoFundingThreshold);

    const mediatorWrapper = this.mediatorProvider.getMediatorWrapperWithAddress(mediatorAddress);
    await mediatorWrapper.depositFunds(senderAddress, amount);
    res.json({});
  }

}
