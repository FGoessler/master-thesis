import * as express from "express";
import { AppModule } from "./AppModule";
import Server from "./Server";
import { Config } from "./config";

const config: Config = require("./config.json");
const ethNodeUrlEnv = process.env.ETH_NODE_URL;
if (ethNodeUrlEnv) {
  config.ethNodeUrl = ethNodeUrlEnv;
}
const redisHost = process.env.REDIS_HOST;
if (redisHost) {
  config.persistence.redisConfig.host = redisHost;
}

const appModule = new AppModule(config);
const app = new Server(express());

appModule.timerService.startIntervalTimer();

app.useMiddleware(appModule.middleware.requestLogger);
app.useMiddleware(appModule.middleware.signatureValidation);

/**
 * Delivers some basic status information.
 */
app.get("/status", (req, res) => {
  const output = {
    web3ProviderHost: appModule.web3.currentProvider.host,
    accounts: {} as {[addr: string]: string},
    config: config
  };
  for (const acc of appModule.web3.eth.accounts) {
    const balance = appModule.web3.eth.getBalance(acc);
    output.accounts[acc] = balance.toString(10);
  }
  return res.json(output);
});

/**
 * Informs the payment server that the sender (service A) wants to use the service B.
 * This deploys a new Mediator contract on the blockchain.
 */
app.getAsync("/useService", appModule.endpoints.useServiceEndpoint);

/**
 * Validates the given token information for the requesting service provider client.
 * Checks the signature, if there are enough funds, if the mediator is not yet terminated, whether the request counter
 * was increased correctly, the token id and whether the contract has acceptable conditions (costPerRequest etc.).
 */
app.getAsync("/contracts/:mediatorAddress/validateToken", appModule.endpoints.validateTokenEndpoint);

/**
 * Creates a set of request headers with an increasing request counter to use with the service linked to the provided mediator.
 */
app.getAsync("/contracts/:mediatorAddress/createSignatureHeaders", appModule.endpoints.signRequestEndpoint);

/**
 * Deposits some funds of the sender into the given Mediator.
 * Only the consuming service (A) can do this.
 */
app.getAsync("/contracts/:mediatorAddress/deposit/:amount", appModule.endpoints.depositEndpoint);

/**
 * Transfers the funds that are locked in the Mediator to the providing service (B).
 * Only the providing service (B) can do this.
 */
app.getAsync("/contracts/:mediatorAddress/payout", appModule.endpoints.payoutEndpoint);

/**
 * Starts to redeem the given token.
 * Only the providing service (B) can do this.
 */
app.getAsync("/contracts/:mediatorAddress/redeemToken", appModule.endpoints.redeemTokenEndpoint);

/**
 * Starts the termination of the given Mediator.
 * If the sender is B this is nearly instant.
 * If the sender is A the Mediator will be terminated after a timeout.
 */
app.getAsync("/contracts/:mediatorAddress/terminate", appModule.endpoints.terminationEndpoint);

/**
 * Gets the termination status of the Mediator.
 *
 * Example response:
 * {
 *  terminated: false,
 *  terminationRunning: true,
 *  willTerminateAt: 143736927 // unix timestamp
 * }
 */
app.getAsync("/contracts/:mediatorAddress/terminationStatus", appModule.endpoints.terminationStatusEndpoint);

/**
 * Returns the amount of ether both parties have locked in this mediator contract.
 * {
 *  serviceConsumerFunds: "50000",     // in wei
 *  serviceProviderFunds: "2000000"    // in wei
 * }
 */
app.getAsync("/contracts/:mediatorAddress/funds", appModule.endpoints.fundsEndpoint);

app.useErrorMiddleware(appModule.middleware.errorHandler);

app.listen(config.port, () => {
  console.log(`Server up and running on port ${config.port}.`);
});
