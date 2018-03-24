const MediatorContractHelper = require("./helpers/MediatorContractHelper");
const clientFactory = require("./helpers/clientFactory");
const testUtil = require("./helpers/testUtil");
const util = require("util");

describe("token redemption", () => {
  let consumerClient, contract, serviceState;

  beforeEach(testUtil.testAsync(async () => {
    consumerClient = clientFactory.createConsumerClient();

    serviceState = (await consumerClient.init())[0];
    contract = new MediatorContractHelper(serviceState.mediatorAddress);
  }), 10000);

  it("declines token redemption by the service consumer", testUtil.testAsync(async () => {
    let query = "/contracts/" + serviceState.mediatorAddress + "/redeemToken";
    let reqPromise = testUtil.performSignedPaymentServerRequest(consumerClient.config.address, consumerClient.config.privateKey, query);
    await testUtil.expectErrorFromPromise(reqPromise, (err) => {
      expect(err.message).toEqual("The sender of the request is not allowed to perform this action. E.g. he is the consuming service and the action is only permitted by the providing service.");
      expect(err.code).toEqual(2);
      return true;
    });
  }));

});
