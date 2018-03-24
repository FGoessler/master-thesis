const fs = require("fs");
const redis = require("redis");
const Web3 = require("web3");

import { Config } from "./config";

import { PersistenceService } from "./services/PersistenceService";
import { RedisPersistenceService } from "./services/RedisPersistenceService";
import { InMemPersistenceService } from "./services/InMemPersistenceService";
import { FundingService } from "./services/FundingService";
import { TokenStoreService } from "./services/TokenStoreService";
import { MediatorListService } from "./services/MediatorListService";
import { MediatorProvider } from "./services/MediatorProvider";
import MediatorCompiler from "./MediatorContract/MediatorCompiler";
import TransactionValidator from "./MediatorContract/TransactionValidator";
import TokenIdGenerator from "./services/TokenIdGenerator";
import TokenRedemptionService from "./services/TokenRedemptionService";
import TimerService from "./services/TimerService";

import TerminationStatusEndpoint from "./endpoints/TerminationStatusEndpoint";
import TerminationEndpoint from "./endpoints/TerminationEndpoint";
import UseServiceEndpoint from "./endpoints/UseServiceEndpoint";
import SignRequestEndpoint from "./endpoints/SignRequestEndpoint";
import RedeemTokenEndpoint from "./endpoints/RedeemTokenEndpoint";
import PayoutEndpoint from "./endpoints/PayoutEndpoint";
import FundsEndpoint from "./endpoints/FundsEndpoint";
import DepositEndpoint from "./endpoints/DepositEndpoint";
import { ValidateTokenEndpoint } from "./endpoints/ValidateTokenEndpoint";
import SignatureValidation from "./middleware/SignatureValidation";
import RequestLogger from "./middleware/RequestLogger";
import ErrorHandler from "./middleware/ErrorHandler";

class Endpoints {
  useServiceEndpoint: any;
  validateTokenEndpoint: ValidateTokenEndpoint;
  signRequestEndpoint: any;
  depositEndpoint: any;
  payoutEndpoint: any;
  redeemTokenEndpoint: any;
  terminationEndpoint: any;
  terminationStatusEndpoint: any;
  fundsEndpoint: any;
}

class Middleware {
  errorHandler: ErrorHandler;
  requestLogger: RequestLogger;
  signatureValidation: SignatureValidation;
}

/**
 * The AppModule is the central place to define dependencies and inject each service and endpoint with the
 * services it needs.
 * Through this dependencies are very explicit and service can be easily instantiated in unit test and injected
 * with mocks.
 */
export class AppModule {

  public web3: any;
  public persistenceService: PersistenceService;
  public mediatorCompiler: MediatorCompiler;
  public transactionValidator: TransactionValidator;
  public mediatorProvider: MediatorProvider;
  public mediatorListService: MediatorListService;
  public tokenStoreService: TokenStoreService;
  public tokenIdGenerator: any;
  public fundingService: FundingService;
  public tokenRedemptionService: any;
  public timerService: any;

  public endpoints = new Endpoints();
  public middleware = new Middleware();

  private config: any;

  constructor(config: Config) {
    this.config = config;

    this.web3 = new Web3(new Web3.providers.HttpProvider(config.ethNodeUrl));
    if (config.persistence.type === "redis") {
      const redisClient = redis.createClient(config.persistence.redisConfig);
      this.persistenceService = new RedisPersistenceService(redisClient);
    } else {
      this.persistenceService = new InMemPersistenceService();
    }

    this.mediatorCompiler = new MediatorCompiler(this.web3, fs);
    this.transactionValidator = new TransactionValidator(this.web3, this.mediatorCompiler);
    this.mediatorProvider = new MediatorProvider(this.mediatorCompiler, this.transactionValidator);
    this.mediatorListService = new MediatorListService(this.mediatorProvider, this.persistenceService);
    this.tokenStoreService = new TokenStoreService(this.persistenceService);
    this.fundingService = new FundingService(this.persistenceService);

    this.tokenIdGenerator = new TokenIdGenerator();
    this.tokenRedemptionService = new TokenRedemptionService(this.tokenStoreService, this.tokenIdGenerator);

    this.timerService = new TimerService(this.mediatorListService, this.mediatorProvider, this.tokenRedemptionService, this.fundingService);

    this.createMiddleware(this.config);

    this.createEndpoints();
  }

  private createMiddleware(config: Config) {
    this.middleware.errorHandler = new ErrorHandler();
    this.middleware.requestLogger = new RequestLogger();
    this.middleware.signatureValidation = new SignatureValidation(config.enforceSignedIncomingRequests);
  }

  private createEndpoints() {
    this.endpoints.useServiceEndpoint = new UseServiceEndpoint(this.mediatorListService, this.mediatorProvider, this.tokenIdGenerator, this.mediatorCompiler);
    this.endpoints.validateTokenEndpoint = new ValidateTokenEndpoint(this.mediatorListService, this.mediatorProvider, this.tokenStoreService);
    this.endpoints.signRequestEndpoint = new SignRequestEndpoint(this.mediatorProvider, this.tokenStoreService);
    this.endpoints.depositEndpoint = new DepositEndpoint(this.mediatorProvider, this.fundingService, this.web3);
    this.endpoints.payoutEndpoint = new PayoutEndpoint(this.mediatorProvider);
    this.endpoints.redeemTokenEndpoint = new RedeemTokenEndpoint(this.mediatorProvider, this.tokenIdGenerator);
    this.endpoints.terminationEndpoint = new TerminationEndpoint(this.mediatorProvider);
    this.endpoints.terminationStatusEndpoint = new TerminationStatusEndpoint(this.mediatorProvider);
    this.endpoints.fundsEndpoint = new FundsEndpoint(this.mediatorProvider);
  }

}
