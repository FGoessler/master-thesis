const express = require("express");
const app = express();
const PaymentClient = require("payment-client-lib");
const http = require("./httpHelper");
const Tracer = require("./tracer");
const waitForPort = require('wait-for-port');

const paymentActivated = !process.env.PAYMENT_INACTIVE;

let randomNrServiceAddr = "0x0ff5c2f25c394a1e69153d658d10fec6a90bc668";
let persistenceServiceAddr = "0xbe32869ae95f64fae54353a08ed65e63cef4bac7";
let client;
if (paymentActivated) {
  client = new PaymentClient({
    paymentServer: {
      protocol: "http:",
      hostname: "payment-server-2",
      port: 3000
    },
    address: "0xaae00f546ab93bf19cc59b9dbf59db23076598d7",
    privateKey: "0x4bb4813d85fbc707432e225a7d5ab5b1f3e2a920a91dcc34309b0b41ea321d37",
    targetServices: [
      {
        name: "RandomNrService",
        address: randomNrServiceAddr,
        fundingAmount: PaymentClient.toWei(5, "finney"),
        costPerRequest: PaymentClient.toWei(1, "nanoether"),
        tokenRedemptionTimeout: 20,
        terminationTimeout: 40
      },
      {
        name: "PersistenceService",
        address: persistenceServiceAddr,
        fundingAmount: PaymentClient.toWei(5, "finney"),
        costPerRequest: PaymentClient.toWei(2, "nanoether"),
        tokenRedemptionTimeout: 20,
        terminationTimeout: 40
      }
    ]
  });
//waitForPort("payment-server-2", 3000, () => { console.log("initializing client..."); client.init(); });

  app.get("/init", (req, res) => {
    console.log("initializing client...");
    client.init()
      .then(() => {
        res.json({done: true});
      });
  });
} else {
  client = {
    signRequest: () => {
      return Promise.resolve({"x-pay-token-id": "no-payment-active"})
    }
  }
}

app.get("/action", (req, res) => {
  let tracer = new Tracer();
  let lastUsedTokenId1, lastUsedTokenId2;
  tracer.startAction("Sign1");
  client.signRequest(randomNrServiceAddr)
    .then((headers) => {
      tracer.endAction("Sign1");
      console.log(JSON.stringify(headers));
      lastUsedTokenId1 = headers["x-pay-token-id"];
      tracer.startAction("Req1");
      return http.request({
        protocol: "http:",
        hostname: "random-nr-service",
        port: "3000",
        method: 'GET',
        path: "/randomNumber",
        headers: headers
      });
    })
    .then((json) => {
      tracer.endAction("Req1");
      tracer.startAction("Sign2");
      return client.signRequest(persistenceServiceAddr)
        .then((headers) => {
          tracer.endAction("Sign2");
          console.log(JSON.stringify(headers));
          lastUsedTokenId2 = headers["x-pay-token-id"];
          tracer.startAction("Req2");
          return http.request({
            protocol: "http:",
            hostname: "persistence-service",
            port: "3000",
            method: 'GET',
            path: "/save?nr=" + json.number,
            headers: headers
          })
        })
        .then(() => {
          tracer.endAction("Req2");
          return json.number;
        })
    })
    .then((randomNr) => {
      console.log(tracer.getTrace());
      res.json({
        savedNumber: randomNr,
        lastUsedTokenId1: lastUsedTokenId1,
        lastUsedTokenId2: lastUsedTokenId2,
        trace: tracer.getTrace()
      });
    })
    .catch((err) => {
      tracer.atomicAction("Error");
      res.status(500);
      console.log("TOTAL EVAL: " + JSON.stringify(tracer.getTrace()));
      res.json({error: err, trace: tracer.getTrace()})
    });
});

if (paymentActivated) {
  app.get("/terminate", (req, res) => {
    let a = client.terminate(client.mediatorAddressForService(randomNrServiceAddr));
    let b = client.terminate(client.mediatorAddressForService(persistenceServiceAddr));
    Promise.all([a, b])
      .then(() => {
        res.json({terminationStarted: true});
      })
      .catch((e) => {
        res.json({terminationStarted: false, error: e});
      });
  });
}

app.listen(3000, () => {
  console.log(`Server up and running on port 3000.`);
});
