const config = require("../../config");
const PaymentClient = require("payment-client-lib");

function createConsumerClient(opts = {}) {
  return new PaymentClient({
    paymentServer: config.paymentServer,
    address: "0xaae00f546ab93bf19cc59b9dbf59db23076598d7",
    privateKey: "0x4bb4813d85fbc707432e225a7d5ab5b1f3e2a920a91dcc34309b0b41ea321d37",
    additionalToleranceSeconds: 0.5,
    targetServices: [
      {
        name: "test service",
        address: "0xbe32869ae95f64fae54353a08ed65e63cef4bac7",
        fundingAmount: PaymentClient.toWei(5, "finney"),
        costPerRequest: opts.costPerRequest || PaymentClient.toWei(1, "nanoether"),
        tokenRedemptionTimeout: opts.tokenRedemptionTimeout || 1,
        terminationTimeout: opts.terminationTimeout || 2
      }
    ]
  });
}

function createProviderClient() {
  return new PaymentClient({
    paymentServer: config.paymentServer,
    address: "0xbe32869ae95f64fae54353a08ed65e63cef4bac7",
    privateKey: "0x41fdbe05c855ba62afe3fba812e0720f50cce8b00ef9df1b84697780bb35bbe4",
    additionalToleranceSeconds: 0.5,
    providerConfig: {
      minCostPerRequest: PaymentClient.toWei(1, "nanoether"),
      terminationTimeout: 2,
      tokenRedemptionTimeout: 1
    }
  });
}

module.exports = {
  createConsumerClient: createConsumerClient,
  createProviderClient: createProviderClient
};
