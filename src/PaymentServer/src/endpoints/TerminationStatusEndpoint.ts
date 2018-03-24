import { Request, Response } from "express";
import { MediatorProvider } from "../services/MediatorProvider";

export default class TerminationStatusEndpoint {
  private mediatorProvider: MediatorProvider;

  constructor(_mediatorProvider: MediatorProvider) {
    this.mediatorProvider = _mediatorProvider;
  }

  async handle(req: Request, res: Response) {
    const mediatorAddress = req.params.mediatorAddress;
    let responseJson = {};

    const mediatorWrapper = this.mediatorProvider.getMediatorWrapperWithAddress(mediatorAddress);

    if (await mediatorWrapper.getTerminated()) {
      responseJson = {
        terminated: true
      };
    } else {
      const terminationStartedAt = parseInt((await mediatorWrapper.getTerminationStartedAt()).toString(10));
      if (terminationStartedAt !== 0) {
        const terminationTimeout = parseInt((await mediatorWrapper.getTerminationTimeout()).toString(10));
        responseJson = {
          terminated: false,
          terminationRunning: true,
          willTerminateAt: terminationStartedAt + terminationTimeout
        };
      } else {
        responseJson = {
          terminated: false
        };
      }
    }

    res.json(responseJson);
  }
}
