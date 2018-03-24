import { Mediator, MediatorWrapper } from "../MediatorContract/MediatorWrapper";
import { EthAddress } from "../services/PersistenceService";
import MediatorCompiler from "../MediatorContract/MediatorCompiler";
import TransactionValidator from "../MediatorContract/TransactionValidator";

export class MediatorProvider {

  private mediatorCompiler: MediatorCompiler;
  private transactionValidator: TransactionValidator;
  private cachedMediatorWrappers: { [addr: string]: Mediator };

  constructor(mediatorCompiler: MediatorCompiler, transactionValidator: TransactionValidator) {
    this.cachedMediatorWrappers = {};
    this.mediatorCompiler = mediatorCompiler;
    this.transactionValidator = transactionValidator;
  }

  getMediatorWrapperWithAddress(mediatorAddress: EthAddress): Mediator {
    const cachedMediator = this.cachedMediatorWrappers[mediatorAddress];
    if (cachedMediator) {
      return cachedMediator;
    } else {
      const mediatorContract = this.mediatorCompiler.getMediatorContract().at(mediatorAddress);
      const mediatorWrapper = new MediatorWrapper(mediatorAddress, this.transactionValidator, mediatorContract);
      this.cachedMediatorWrappers[mediatorAddress] = mediatorWrapper;
      return mediatorWrapper;
    }
  }

}
