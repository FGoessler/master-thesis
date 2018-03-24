const _ = require("lodash");
const sig = require("./signatureHelper");
const ethUtil = require("./ethUtil");
const PaymentServerCommunicator = require("./paymentServerCommunicator");

const defaultConfig = {
  // Ethereum address of the account for this client.
  address: null,
  // The private key of the account for this client. Required to sign message with this lib on behalf of this client.
  privateKey: null,
  // Configuration where this client can reach it's payment server. Please note that this payment server's ethereum
  // node must have the given account configured and unlocked.
  paymentServer: {
    protocol: "http:",
    hostname: "localhost",
    port: 3000
  },
  // A list of services this client wants to be able to talk to. For each a Mediator contract is used/deployed.
  targetServices: [
    // {
    //    // The name of the service - just used for debugging.
    //    name: "Service A",
    //    // The ethereum address of the consumed service. Used for paying this service.
    //    address: "0x12345abcdef",
    //    // The amount of ether a fund operation should transfer from the service's ethereum account to the mediator.
    //    fundingAmount: PaymentClient.toWei(5, "finney"), // BigNumber
    //    // The minimum amount of ether remaining in the contract. If the funds go below this value the Payment Server
    //    // will automatically try to refund the mediator. Pass 0 or undefined here to avoid this behaviour.
    //    autoFundingThreshold: PaymentClient.toWei(1, "finney"), // BigNumber
    //    // The cost in ether of a request between the providing service and the consuming service.
    //    costPerRequest: PaymentClient.toWei(1, "nanoether"),    // BigNumber - optional
    //    // The timeout in seconds for the contract termination.
    //    terminationTimeout: 3600,   // optional
    //    // The timeout in seconds for token redemptions.
    //    tokenRedemptionTimeout: 3600     // optional
    //    // Set this to true to avoid creating new mediator contracts, but reuse existing ones.
    //    allowReuseExistingMediator: false
    //    // The ethereum address of the deployed mediator.
    //    mediatorAddress: null,  // gets set automatically after successful mediator contract deployment
    // }
  ],
  // Additional time in seconds that is used before termination and token redeem operations are finalized to avoid
  // problems with not fully synced clocks.
  additionalToleranceSeconds: 5,
  // Configure what settings this service provider accepts from consumers that deploy mediator contracts.
  providerConfig: {
    minCostPerRequest: ethUtil.toWei(1, "nanoether"),
    terminationTimeout: 3600,
    tokenRedemptionTimeout: 3600,
    minFundingBuffer: ethUtil.toWei(10, "nanoether")
  },
  // Addresses of all incoming services.
  incomingServices: {
    // "mediatorAddress": 1
  }
};

class PaymentClient {
  /**
   * @param params Includes the service's keystore data, it's wallet address, the services
   *  it wants to communicate with and the address of the payment server. See defaultConfig above.
   */
  constructor(params) {
    this.config = _.merge({}, defaultConfig, params);
  }

  /**
   * Initializes the payment framework and sets up the mediator contracts if needed.
   * @returns {Promise} A promise returning the configured services.
   */
  init() {
    this.paymentServerCommunicator = new PaymentServerCommunicator(this.config);

    if (this.config.targetServices.length === 0) {
      return Promise.resolve(this.config.targetServices);
    }

    return this.paymentServerCommunicator.registerPlannedServiceUsagesWithPaymentServer()
      .then(() => { return this.paymentServerCommunicator.fundMediators(); })
      .then(() => { return this.config.targetServices; });
  }

  /**
   * Creates a set of payment signature headers with an increasing request counter.
   * @param {String} destination The ethereum address of the providing service.
   * @returns {Promise} A promise returning the generated headers which should be included on the HTTP request.
   */
  signRequest(destination) {
    let mediatorAddress = this.mediatorAddressForService(destination);
    return this.paymentServerCommunicator.getSignatureHeaders(mediatorAddress, this.config.privateKey);
  }

  /**
   * Checks the given request payload and the headers whether the request is valid.
   * @param {Object} headers The HTTP header of the request that shall be checked.
   * @returns {Promise} A promise that resolves if the headers are valid.
   */
  validateRequest(headers) {
    let mediatorAddress = headers["x-pay-mediator"];
    let params = {
      sender: headers["x-pay-sender"],
      mediator: mediatorAddress,
      signature: headers["x-pay-signature"],
      tokenId: headers["x-pay-token-id"],
      reqCount: headers["x-pay-req-count"],
      minCostPerRequest: this.config.providerConfig.minCostPerRequest,
      terminationTimeout: this.config.providerConfig.terminationTimeout,
      tokenRedemptionTimeout: this.config.providerConfig.tokenRedemptionTimeout
    };

    return this.paymentServerCommunicator.validateRequest(params)
      .then((result) => {
        this.config.incomingServices[mediatorAddress] = 1;
        return result;
      });
  }

  redeemToken(mediatorAddress) {
    return this.paymentServerCommunicator.startTokenRedemption(mediatorAddress);
  }

  requestPayout(mediatorAddress) {
    return this.paymentServerCommunicator.requestPayout(mediatorAddress);
  }

  terminate(mediatorAddress) {
    return this.paymentServerCommunicator.terminate(mediatorAddress);
  }

  getTerminationStatus(mediatorAddress) {
    return this.paymentServerCommunicator.getTerminationStatus(mediatorAddress);
  }

  getMediatorFunds(mediatorAddress) {
    return this.paymentServerCommunicator.getMediatorFunds(mediatorAddress)
  }

  getStatus() {
    return this.paymentServerCommunicator.getStatus()
  }

  getMediatorAddressesOfIncomingServices() {
    return Object.keys(this.config.incomingServices);
  }

  mediatorAddressForService(destination) {
    let destinationService = this.config.targetServices.find((s) => {
      return s.address === destination
    });
    return destinationService.mediatorAddress;
  }

  static toWei(number, unit) {
    return ethUtil.toWei(number, unit);
  }

  static fromWei(number, unit) {
    return ethUtil.fromWei(number, unit);
  }
}

module.exports = PaymentClient;
