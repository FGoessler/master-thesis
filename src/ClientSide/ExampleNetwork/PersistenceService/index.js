const express = require("express");
const app = express();
const PaymentClient = require("payment-client-lib");
const waitForPort = require('wait-for-port');

const paymentActivated = !process.env.PAYMENT_INACTIVE;

if (paymentActivated) {
  console.log("Payment active.");
  let client = new PaymentClient({
    paymentServer: {
      protocol: "http:",
      hostname: "payment-server-1",
      port: 3000
    },
    address: "0xbe32869ae95f64fae54353a08ed65e63cef4bac7",
    privateKey: "0x41fdbe05c855ba62afe3fba812e0720f50cce8b00ef9df1b84697780bb35bbe4",
    additionalToleranceSeconds: 2,
    runPeriodicTerminationChecker: true,
    periodicTerminationCheckerInterval: 5,
    providerConfig: {
      minCostPerRequest: PaymentClient.toWei(2, "nanoether"),
      terminationTimeout: 40,
      tokenRedemptionTimeout: 20
    }
  });
  console.log("Waiting for payment server to be up...");
  waitForPort("payment-server-1", 3000, {numRetries: 60, retryInterval: 1000}, (err) => {
    if (err) {
      console.error("Failed connecting to payment server:\n" + err);
    } else {
      console.log("initializing client...");
      client.init()
    }
  });

  app.use((req, res, next) => {
    if (req.path === "/redeem") {
      next();
      return;
    }

    let startTime = new Date().getTime();
    console.log(JSON.stringify(req.headers));
    client.validateRequest(req.headers)
      .then(() => {
        console.log("Request validation time: " + (new Date().getTime() - startTime));
        next()
      })
      .catch((err) => {next(err)});
  });

  app.get("/redeem", (req, res) => {
    client.redeemToken(client.getMediatorAddressesOfIncomingServices()[0])
      .then(() => {
        res.json({redemptionStarted: true});
      })
      .catch((e) => {
        res.json({redemptionStarted: false, error: e});
      });
  });
}

app.get("/save", (req, res) => {
  return res.sendStatus(201);
});

app.listen(3000, () => {
  console.log(`Server up and running on port 3000.`);
});
