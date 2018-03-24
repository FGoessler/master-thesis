const express = require("express");
const app = express();
const PaymentClient = require("payment-client-lib");
const waitForPort = require('wait-for-port');

const paymentActivated = !process.env.PAYMENT_INACTIVE;

if(paymentActivated) {
  console.log("Payment active.");
  let client = new PaymentClient({
    paymentServer: {
      protocol: "http:",
      hostname: "payment-server-1",
      port: 3000
    },
    address: "0x0ff5c2f25c394a1e69153d658d10fec6a90bc668",
    privateKey: "0x9324969c09ebd6b8b36119f5f79b5d7a05afab0368bf8cdd671258a6bd4c44a8",
    additionalToleranceSeconds: 2,
    runPeriodicTerminationChecker: true,
    periodicTerminationCheckerInterval: 5,
    providerConfig: {
      minCostPerRequest: PaymentClient.toWei(1, "nanoether"),
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
    if (req.path !== "/randomNumber") {
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

  app.get("/payout", (req, res) => {
    client.requestPayout(client.getMediatorAddressesOfIncomingServices()[0])
      .then(() => {
        res.json({p: true});
      })
      .catch((e) => {
        res.json({p: false, error: e});
      });
  });
}

app.get("/randomNumber", (req, res) => {
  return res.json({number: Math.random()});
});



app.listen(3000, () => {
  console.log(`Server up and running on port 3000.`);
});
