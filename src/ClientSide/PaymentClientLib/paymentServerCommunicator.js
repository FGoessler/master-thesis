let _ = require("lodash");
let ethUtil = require("./ethUtil");
let http = require("./httpHelper");

function PaymentServerCommunicator(config) {

  function registerPlannedServiceUsagesWithPaymentServer() {
    let serviceRegistrationPromises = [];
    for (let service of config.targetServices) {
      let serviceProviderAddress = service.address;
      let pathAndQueryString = "/useService?serviceProvider=" + serviceProviderAddress;
      if (service.allowReuseExistingMediator) pathAndQueryString += "&allowReuseExistingMediator=" + service.allowReuseExistingMediator;
      if (service.costPerRequest) pathAndQueryString += "&costPerRequest=" + service.costPerRequest;
      if (service.terminationTimeout) pathAndQueryString += "&terminationTimeout=" + service.terminationTimeout;
      if (service.tokenRedemptionTimeout) pathAndQueryString += "&tokenRedemptionTimeout=" + service.tokenRedemptionTimeout;

      let serviceRegistrationPromise = http.signedPaymentServerRequest(config, pathAndQueryString)
        .then((resJSON) => {
          let service = config.targetServices.find((s) => {
            return s.address === serviceProviderAddress
          });
          service.mediatorAddress = resJSON.mediatorAddress;
        });
      serviceRegistrationPromises.push(serviceRegistrationPromise);
    }

    return Promise.all(serviceRegistrationPromises)
      .then(() => {
        return config.targetServices
      });
  }

  function fundMediators() {
    let fundingPromises = [];
    for (let service of config.targetServices) {
      fundingPromises.push(fundMediator(service));
    }
    return Promise.all(fundingPromises);
  }

  function fundMediator(service) {
    if (!service || !_.isString(service.mediatorAddress) || !service.fundingAmount) {
      return Promise.reject(new Error("Could not fund service (" + service + ")!"));
    }
    let strNumber = ethUtil.toBigNumber(service.fundingAmount).toString(10);
    let pathAndQueryString = "/contracts/" + service.mediatorAddress + "/deposit/" + strNumber;
    if (service.autoFundingThreshold) {
      pathAndQueryString += "?autoFundingThreshold=" + service.autoFundingThreshold.toString(10);
    }

    return http.signedPaymentServerRequest(config, pathAndQueryString);
  }

  function validateRequest(params) {
    if (!params || !_.isString(params.mediator)) {
      return Promise.reject(new Error("Could not validate request for " + params.mediator + "!"));
    }
    let pathAndQueryString = "/contracts/" + params.mediator + "/validateToken"
      + "?sender=" + params.sender
      + "&mediator=" + params.mediator
      + "&signature=" + params.signature
      + "&tokenId=" + params.tokenId
      + "&reqCount=" + params.reqCount
      + "&minCostPerRequest=" + ethUtil.toBigNumber(params.minCostPerRequest).toString(10)
      + "&terminationTimeout=" + params.terminationTimeout
      + "&tokenRedemptionTimeout=" + params.tokenRedemptionTimeout;

    return http.signedPaymentServerRequest(config, pathAndQueryString);
  }

  function getSignatureHeaders(mediatorAddress, privateKey) {
    if (!_.isString(mediatorAddress)) {
      return Promise.reject(new Error("Could not get signature headers for mediator (" + mediatorAddress + ")!"));
    }
    let pathAndQueryString = "/contracts/" + mediatorAddress + "/createSignatureHeaders?privateKey=" + privateKey;

    return http.signedPaymentServerRequest(config, pathAndQueryString)
  }

  function startTokenRedemption(mediatorAddress) {
    if (!_.isString(mediatorAddress)) {
      return Promise.reject(new Error("No valid mediator address given to redeem token (" + mediatorAddress + ")!"));
    }
    let pathAndQueryString = "/contracts/" + mediatorAddress + "/redeemToken";

    return http.signedPaymentServerRequest(config, pathAndQueryString)
  }

  function requestPayout(mediatorAddress) {
    if (!_.isString(mediatorAddress)) {
      return Promise.reject(new Error("No valid mediator address given to request payout for service (" + mediatorAddress + ")!"));
    }
    let pathAndQueryString = "/contracts/" + mediatorAddress + "/payout";

    return http.signedPaymentServerRequest(config, pathAndQueryString);
  }

  function getTerminationStatus(mediatorAddress) {
    if (!_.isString(mediatorAddress)) {
      return Promise.reject(new Error("No valid mediator address given to get termination status for service (" + mediatorAddress + ")!"));
    }
    let pathAndQueryString = "/contracts/" + mediatorAddress + "/terminationStatus";

    return http.signedPaymentServerRequest(config, pathAndQueryString)
  }

  function getMediatorFunds(mediatorAddress) {
    if (!_.isString(mediatorAddress)) {
      return Promise.reject(new Error("No valid mediator address given to get funds for service (" + mediatorAddress + ")!"));
    }
    let pathAndQueryString = "/contracts/" + mediatorAddress + "/funds";

    return http.signedPaymentServerRequest(config, pathAndQueryString)
  }

  function terminate(mediatorAddress) {
    if (!_.isString(mediatorAddress)) {
      return Promise.reject(new Error("No valid mediator address given to terminate service (" + mediatorAddress + ")!"));
    }
    let pathAndQueryString = "/contracts/" + mediatorAddress + "/terminate";

    return http.signedPaymentServerRequest(config, pathAndQueryString)
  }

  function getStatus() {
    let pathAndQueryString = "/status";
    return http.signedPaymentServerRequest(config, pathAndQueryString);
  }

  this.registerPlannedServiceUsagesWithPaymentServer = registerPlannedServiceUsagesWithPaymentServer;
  this.fundMediator = fundMediator;
  this.fundMediators = fundMediators;
  this.getSignatureHeaders = getSignatureHeaders;
  this.validateRequest = validateRequest;
  this.startTokenRedemption = startTokenRedemption;
  this.requestPayout = requestPayout;
  this.terminate = terminate;
  this.getTerminationStatus = getTerminationStatus;
  this.getMediatorFunds = getMediatorFunds;
  this.getStatus = getStatus;
}

module.exports = PaymentServerCommunicator;
