const request = require('request-promise-native');
const MediatorContractHelper = require("./helpers/MediatorContractHelper");
const testUtil = require("./helpers/testUtil");
const clientFactory = require("./helpers/clientFactory");

describe("request signing via PaymentClientLib", () => {
  let clientA, clientB, contract, serviceState;

  beforeEach(testUtil.testAsync(async () => {
    clientA = clientFactory.createConsumerClient();
    clientB = clientFactory.createProviderClient();
    await clientB.init();
    serviceState = (await clientA.init())[0];
    contract = new MediatorContractHelper(serviceState.mediatorAddress);
  }), 10000);

  it("creates signature headers" , testUtil.testAsync(async () => {
    let headers = await clientA.signRequest("0xbe32869ae95f64fae54353a08ed65e63cef4bac7");

    expect(headers["x-pay-sender"]).toEqual("0xaae00f546ab93bf19cc59b9dbf59db23076598d7");
    expect(headers["x-pay-signature"]).toBeDefined();
    expect(headers["x-pay-mediator"]).toBeDefined();
    expect(headers["x-pay-mediator"]).toEqual(serviceState.mediatorAddress);
    expect(headers["x-pay-req-count"]).toEqual("1");

    expect(headers["x-pay-token-id"]).toBeDefined();
    expect(headers["x-pay-token-id"].length).toBeGreaterThan(0);
    expect((await contract.getActiveTokenId()).toString(10)).toEqual(headers["x-pay-token-id"]);
  }));

  it("increments the request counter" , testUtil.testAsync(async () => {
    let headers = await clientA.signRequest("0xbe32869ae95f64fae54353a08ed65e63cef4bac7");
    expect(headers["x-pay-req-count"]).toEqual("1");
    headers = await clientA.signRequest("0xbe32869ae95f64fae54353a08ed65e63cef4bac7");
    expect(headers["x-pay-req-count"]).toEqual("2");
    headers = await clientA.signRequest("0xbe32869ae95f64fae54353a08ed65e63cef4bac7");
    expect(headers["x-pay-req-count"]).toEqual("3");
  }));

});
