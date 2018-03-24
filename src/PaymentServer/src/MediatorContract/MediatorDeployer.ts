import MediatorCompiler from "../MediatorContract/MediatorCompiler";
import { BigNumber } from "../util/BigNumberHelper";
import { MediatorDeploymentError } from "../errors";
import { EthAddress } from "../services/PersistenceService";
const Logger = require("../util/Logger").default;

/**
 * Used to deploy a new Mediator contract on the blockchain.
 */
export default class MediatorDeployer {
  private serviceProvider: EthAddress;
  private serviceConsumer: EthAddress;
  private mediatorCompiler: MediatorCompiler;
  private costPerRequest: number;
  private terminationTimeout: number;
  private tokenRedemptionTimeout: number;
  private initialTokenId: BigNumber;

  constructor(
    mediatorCompiler: MediatorCompiler,
    serviceProvider: EthAddress,
    serviceConsumer: EthAddress,
    initialTokenId: BigNumber,
    costPerRequest = 1,
    terminationTimeout = 3600,
    tokenRedemptionTimeout = 3600
  ) {
    this.serviceProvider = serviceProvider;
    this.serviceConsumer = serviceConsumer;
    this.initialTokenId = initialTokenId;
    this.costPerRequest = costPerRequest;
    this.terminationTimeout = terminationTimeout;
    this.tokenRedemptionTimeout = tokenRedemptionTimeout;
    this.mediatorCompiler = mediatorCompiler;
  }

  deploy(): Promise<any> {
    if (!this.serviceProvider) {
      throw new MediatorDeploymentError(new Error("Missing service provider!"));
    }
    if (!this.serviceConsumer) {
      throw new MediatorDeploymentError(new Error("Missing service consumer!"));
    }
    if (!this.initialTokenId) {
      throw new MediatorDeploymentError(new Error("Missing initial token id!"));
    }

    Logger.log(`Starting mediator deployment (${this.serviceProvider}/${this.serviceConsumer})...`);

    const Mediator = this.mediatorCompiler.getMediatorContract();
    const bytecode = "0x" + this.mediatorCompiler.getCompiledContract().bytecode;

    return new Promise((resolve, reject) => {
      Mediator.new(
        this.serviceProvider,
        this.initialTokenId.toString(10),
        this.costPerRequest,
        this.terminationTimeout,
        this.tokenRedemptionTimeout,
        {from: this.serviceConsumer, data: bytecode, gas: 2000000},
        (err: Error, contract: any) => {
          if (!err && !!contract.address) {
            Logger.log(`Mediator deployed (${this.serviceProvider}/${this.serviceConsumer}) -> ${contract.address}`);
            resolve(contract);
          } else if (!!err) {
            Logger.error(`Mediator deployment failed! (${this.serviceProvider}/${this.serviceConsumer}) - ${err}`);
            reject(new MediatorDeploymentError(err));
          }
        });
    });
  }
}
