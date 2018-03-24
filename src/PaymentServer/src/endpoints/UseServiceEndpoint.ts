import { Request, Response } from "express";
import { MediatorProvider } from "../services/MediatorProvider";
import { MediatorListService } from "../services/MediatorListService";
import MediatorCompiler from "../MediatorContract/MediatorCompiler";
import TokenIdGenerator from "../services/TokenIdGenerator";
import MediatorDeployer from "../MediatorContract/MediatorDeployer";
import { beNonEmptyString } from "../util/preconditions";

export default class UseServiceEndpoint {
  private mediatorListService: MediatorListService;
  private mediatorProvider: MediatorProvider;
  private mediatorCompiler: MediatorCompiler;
  private tokenIdGenerator: TokenIdGenerator;

  constructor(mediatorListService: MediatorListService, mediatorProvider: MediatorProvider, tokenIdGenerator: TokenIdGenerator, mediatorCompiler: MediatorCompiler) {
    this.mediatorListService = mediatorListService;
    this.mediatorProvider = mediatorProvider;
    this.tokenIdGenerator = tokenIdGenerator;
    this.mediatorCompiler = mediatorCompiler;
  }

  async handle(req: Request, res: Response) {
    const senderAddress = beNonEmptyString(req.header("x-pay-sender"));

    if (req.query.allowReuseExistingMediator) {
      const mediatorAddress = await this.mediatorListService.getMediatorAddressForConsumerAndProviderIfExisting(senderAddress, req.query.serviceProvider);
      if (mediatorAddress) {
        const mediatorWrapper = this.mediatorProvider.getMediatorWrapperWithAddress(mediatorAddress);
        if (!await mediatorWrapper.getTerminated()) {
          return;
        }
      }
    }

    const deployer = new MediatorDeployer(
      this.mediatorCompiler,
      req.query.serviceProvider,
      senderAddress,
      this.tokenIdGenerator.createRandomTokenId(),
      req.query.costPerRequest,
      req.query.terminationTimeout,
      req.query.tokenRedemptionTimeout
    );
    const contract = await deployer.deploy();
    await this.mediatorListService.addMediatorAddressOnBehalfOfServiceConsumer(contract.address);
    res.json({mediatorAddress: contract.address});
  }

}
