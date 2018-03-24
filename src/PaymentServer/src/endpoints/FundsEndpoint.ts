import { Request, Response } from "express";
import { MediatorProvider } from "../services/MediatorProvider";

export default class FundsEndpoint {
  private mediatorProvider: MediatorProvider;

  constructor(_mediatorProvider: MediatorProvider) {
    this.mediatorProvider = _mediatorProvider;
  }

  async handle(req: Request, res: Response) {
    const mediatorAddress = req.params.mediatorAddress;
    const mediatorWrapper = this.mediatorProvider.getMediatorWrapperWithAddress(mediatorAddress);

    const conditions = await Promise.all([
      mediatorWrapper.getServiceConsumerFunds(),
      mediatorWrapper.getServiceProviderFunds()
    ]);

    res.json({
      serviceConsumerFunds: conditions[0].toString(10),
      serviceProviderFunds: conditions[1].toString(10)
    });
  }
}
