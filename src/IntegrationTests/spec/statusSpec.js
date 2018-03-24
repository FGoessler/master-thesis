let config = require("../config");
let request = require('request-promise-native');

describe("status endpoint", () => {

  it("provides basic information", (done) => {
    let s = config.paymentServer;
    request({uri: `${s.protocol}//${s.hostname}:${s.port}/status`, json: true})
      .then((json) => {
        expect(json.web3ProviderHost).toEqual(config.ethereumNodeBaseURL);
        expect(Object.keys(json.accounts).length).toBeGreaterThan(0);
        done();
      })
      .catch((err) => fail(err));
  });

});
