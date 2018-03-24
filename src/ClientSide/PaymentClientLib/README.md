# Payment Client Lib

This is a small library to integrate in a microservice to communicate with a Payment Server. It wraps all the signature creation and verification tasks.

## Providing Service Usage

If your service provides a functionality to other services and wants to get paid for this use this configuration approach.

```javascript
let client = new PaymentClient({
    // address of your payment server
    paymentServer: {
      protocol: "http:",
      hostname: "payment-server",
      port: 3000
    },
    // ethereum address of this service
    address: "0xbe32869ae95f64fae54353a08ed65e63cef4bac7",
    // private key of this service aka of the above address
    privateKey: "0x41fdbe05c855ba62afe3fba812e0720f50cce8b00ef9df1b84697780bb35bbe4",
    // parameters for the mediator contract when communicating with this service
    providerConfig: {
      minCostPerRequest: PaymentClient.toWei(2, "nanoether"),
      terminationTimeout: 40,
      tokenRedemptionTimeout: 20
    },
    // Some additional internal config for fine tuning.
    additionalToleranceSeconds: 2,
    runPeriodicTerminationChecker: true,
    periodicTerminationCheckerInterval: 5,
  });
client.init()
    .then(() => {
      // initialized
    });
```

After this is done you can start validating the headers of incoming requests. It's recommended to do this in some sort of server middleware.

```javascript
client.validateRequest(req.headers)
      .then(() => {
        // valid
      })
      .catch((err) => {
        // error / not valid
      });
```


## Consuming Service Usage

If your service uses other services and needs to pay for them use this configuration approach.

```javascript
let targetServiceAddress = "0xbe32869ae95f64fae54353a08ed65e63cef4bac7";
let client = new PaymentClient({
    // address of your payment server
    paymentServer: {
      protocol: "http:",
      hostname: "payment-server",
      port: 3000
    },
    // ethereum address of this service
    address: "0xaae00f546ab93bf19cc59b9dbf59db23076598d7",
    // private key of this service aka of the above address
    privateKey: "0x4bb4813d85fbc707432e225a7d5ab5b1f3e2a920a91dcc34309b0b41ea321d37",
    // list of configurations for services that will be consumed by this service
    targetServices: [
      {
        // Name to identify the service later
        name: "Service-1",
        // The ethereum address of the target service
        address: targetServiceAddress,
        fundingAmount: PaymentClient.toWei(5, "finney"),
        costPerRequest: PaymentClient.toWei(1, "nanoether"),
        tokenRedemptionTimeout: 20,
        terminationTimeout: 40
      }
    ]
  });
client.init()
    .then(() => {
      // initialized
    });
```

After this is done you can create token and signature headers for each request and send them along the http request to the providing service. 

```javascript
client.signRequest(targetServiceAddress)
    .then((headers) => {
        // perform http request with the given headers to the providing service
    })
```


## Other API

Beside these basic functionalities the Payment Client Lib also provides some utility methods to get information about the state of a contract and to trigger a token redemption or mediator termination.

See the [index.js](./index.js) for a full list of functionalities.
