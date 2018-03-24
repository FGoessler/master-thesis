const request = require('request-promise-native');
const MediatorContractHelper = require("./helpers/MediatorContractHelper");
const testUtil = require("./helpers/testUtil");
const clientFactory = require("./helpers/clientFactory");
const PaymentClient = require("payment-client-lib");

describe("client initialization and contract deployment", () => {
  let clientA, contract, mediatorAddress;

  beforeAll(testUtil.testAsync(async () => {
    clientA = clientFactory.createConsumerClient();
    let targetServices = await clientA.init();
    mediatorAddress = targetServices[0].mediatorAddress;
    contract = new MediatorContractHelper(mediatorAddress);
  }), 10000);

  it("gets a mediator address locally" , () => {
    expect(mediatorAddress).toBeTruthy();
    expect(typeof mediatorAddress).toEqual("string");
  });

  it("configures correct participants", testUtil.testAsync(async () => {
    expect(await contract.getServiceConsumer()).toEqual("0xaae00f546ab93bf19cc59b9dbf59db23076598d7");
    expect(await contract.getServiceProvider()).toEqual("0xbe32869ae95f64fae54353a08ed65e63cef4bac7");
  }));

  it("configures termination state correctly", testUtil.testAsync(async () => {
    expect(await contract.getTerminated()).toBeFalsy();
    expect((await contract.getTerminationStartedAt()).toNumber()).toEqual(0);
    expect((await contract.getTerminationTimeout()).toNumber()).toEqual(2);
  }));

  it("configures correct token and cost settings", testUtil.testAsync(async () => {
    expect(await contract.getActiveTokenId()).toBeTruthy();
    expect((await contract.getSoonExpiringTokenIdTimeout()).toNumber()).toEqual(0);
    expect((await contract.getTokenRedemptionTimeout()).toNumber()).toEqual(1);
    expect((await contract.getCostPerRequest()).toString(10)).toEqual(PaymentClient.toWei(1, "nanoether").toString(10));
  }));

  it("funds correctly", testUtil.testAsync(async () => {
    expect((await contract.getServiceConsumerFunds()).toString(10)).toEqual(PaymentClient.toWei(5, "finney").toString(10));
    expect((await contract.getServiceProviderFunds()).toNumber()).toEqual(0);
  }));

});
