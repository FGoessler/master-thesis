# Payment Server

This server component interacts with the ethereum node via RPC calls through web3.js on the one side and offers an HTTP REST like API for microservices on the other side.

## Running

To start the server execute:

```
yarn run start
```

See the config.json file for configuration options.

You can also overwrite some settings in the config.json via environment variables:
- `ETH_NODE_URL`: The URL of the Ethereum node to connect to. Including protocol and port.
- `REDIS_HOST`: The hostname running the redis service.

Please note that the linked ethereum node must have configured accounts (private keys, unlocked, etc.) for all clients that want to use this payment server.

## REST API Endpoints

- `/status`: Delivers basic status information of the payment server.
- `/useService`: Informs the payment server that the sender (service A) wants to use the service B. This deploys a new Mediator contract on the blockchain.
- `/contracts/:mediatorAddress/validateToken`: Validates the given token information for the requesting service provider client. Checks the signature, if there are enough funds, if the mediator is not yet terminated, whether the request counter was increased correctly, the token id and whether the contract has acceptable conditions (costPerRequest etc.).
- `/contracts/:mediatorAddress/createSignatureHeaders`: Creates a set of request headers with an increasing request counter to use with the service linked to the provided mediator.
- `/contracts/:mediatorAddress/deposit/:amount`: Deposits some funds of the sender into the given Mediator. Only the consuming service (A) can do this.
- `/contracts/:mediatorAddress/payout`: Transfers the funds that are locked in the Mediator to the providing service (B). Only the providing service (B) can do this.
- `/contracts/:mediatorAddress/redeemToken`: Starts to redeem the given token. Only the providing service (B) can do this.
- `/contracts/:mediatorAddress/terminate`: Starts the termination of the given Mediator. If the sender is B this is nearly instant. If the sender is A the Mediator will be terminated after a timeout.
- `/contracts/:mediatorAddress/terminationStatus`: Gets the termination status of the Mediator.
- `/contracts/:mediatorAddress/funds`: Returns the amount of ether both parties have locked in this mediator contract.

For more detailed information about the parameters and detailed usage of these endpoints please see the code directly.

The Payment Server and the Mediator contract use a defined set of errors and error codes. See [errors.ts](./src/errors.ts) for a list and definitions.

## Timers

Beside the explicit REST API endpoints the Payment Server also runs a couple of checks in frequent intervals to detect started mediator terminations, receipt redemptions and to regularly redeem receipts.

See the [TimerService.ts](./src/services/TimerService.ts) for the implementation.

## Solidity Contract

The Mediator Solidity contract can be found [here](./src/MediatorContract/Mediator.sol).

## Testing

To run the unit tests execute:

```
yarn run test
```
