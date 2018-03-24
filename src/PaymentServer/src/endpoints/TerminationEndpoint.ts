import { Request, Response } from "express";
import { MediatorProvider } from "../services/MediatorProvider";
import { beNonEmptyString } from "../util/preconditions";

export default class TerminationEndpoint {
  private mediatorProvider: MediatorProvider;

  constructor(_mediatorProvider: MediatorProvider) {
    this.mediatorProvider = _mediatorProvider;
  }

  async handle(req: Request, res: Response) {
    const senderAddress = beNonEmptyString(req.header("x-pay-sender"));
    const mediatorAddress = req.params.mediatorAddress;

    const mediatorWrapper = this.mediatorProvider.getMediatorWrapperWithAddress(mediatorAddress);

    if (await mediatorWrapper.getTerminated()) {
      res.json({terminated: true});
      return;
    }

    const serviceConsumerAddress = await mediatorWrapper.getServiceConsumer();
    if (senderAddress === serviceConsumerAddress) {
      const terminationStartedAt = parseInt((await mediatorWrapper.getTerminationStartedAt()).toString(10));
      if (terminationStartedAt === 0) {
        await mediatorWrapper.startTerminationByConsumer(senderAddress);
      }
      res.json({terminated: false, terminationStarted: true});
    } else {
      await mediatorWrapper.terminateByProvider(senderAddress);
      res.json({terminated: true});
    }

  }
}
