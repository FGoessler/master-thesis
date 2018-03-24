const ethUtil = require("ethereumjs-util");
const http = require('http');
const config = require("../../config");
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereumNodeBaseURL));

function testAsync(runAsync) {
  return (done) => {
    runAsync().then(done, e => {
      if (e.code) {
        let msg = "Code: " + e.code + " - " + e.message;
        if (e.underlyingError) {
          msg += "\nUnderlying Error: " + e.underlyingError.code + " - " + e.underlyingError.message;
        }
        fail(msg);
      } else {
        fail(e.message + "\n" + e.stack);
      }
      done();
    });
  };
}

async function expectErrorFromPromise(promise, expectedErrorMatcher) {
  await promise
    .catch((err) => {
      let errMatches = false;
      if (expectedErrorMatcher instanceof RegExp) {
        errMatches = expectedErrorMatcher.test(err.message);
      } else if (typeof expectedErrorMatcher === "function") {
        errMatches = expectedErrorMatcher(err);
        expectedErrorMatcher = "{{CustomMatcherFunction}}"
      } else {
        errMatches = err.message === expectedErrorMatcher;
      }
      if (!errMatches) {
        return Promise.reject(new Error(`Got wrong error in promise catch clause!\n Expected: ${expectedErrorMatcher} - Actual: ${err.message}`));
      } else {
        return "Catch invoked";
      }
    })
    .then((res) => {
      if (res !== "Catch invoked") {
        return Promise.reject(new Error("Promise should not resolve!"))
      }
    })
}

function createSignature(inputMsg, privateKey) {
  let privateKeyBuffer = ethUtil.toBuffer(privateKey);
  let inputHash = ethUtil.sha256(inputMsg);
  let signature = ethUtil.ecsign(inputHash, privateKeyBuffer);
  return ethUtil.toRpcSig(signature.v, signature.r, signature.s);
}

function request(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      res.setEncoding('utf8');

      let responseContent = null;
      res.on('data', (chunk) => {
        if (!responseContent) {
          responseContent = chunk;
        } else {
          responseContent = responseContent + chunk;
        }
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(responseContent)
        } else {
          try {
            let json = JSON.parse(responseContent);
            let error = objectToError(json);
            error.httpStatusCode = res.statusCode;
            reject(error);
          } catch (err) {
            reject(new Error("HTTP Error (" + res.statusCode + ")\nContent: " + responseContent))
          }
        }
      });
    });

    req.on('error', (e) => {
      reject(e, null);
    });

    req.end();
  }).then((res) => {
    try {
      return JSON.parse(res);
    } catch (err) {
      return {};
    }
  });
}

function objectToError(object) {
  let error = new Error(object.message);
  error.name = object.name;
  error.code = object.code;
  error.metadata = object.metadata;
  if (object.underlyingError) {
    error.underlyingError = objectToError(object.underlyingError);
  }
  return error;
}

function performSignedPaymentServerRequest(senderAddress, senderPrivateKey, pathAndQueryString) {

  let signedPayload = senderAddress + pathAndQueryString;
  let signature = createSignature(signedPayload, senderPrivateKey);

  return request({
    protocol: config.paymentServer.protocol,
    hostname: config.paymentServer.hostname,
    port: config.paymentServer.port,
    method: 'GET',
    path: pathAndQueryString,
    headers: {
      "x-pay-sender": senderAddress,
      "x-pay-signature": signature
    }
  });
}

function getAccountBalance(address) {
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(address, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  })
}

module.exports = {
  testAsync: testAsync,
  expectErrorFromPromise: expectErrorFromPromise,
  createSignature: createSignature,
  performSignedPaymentServerRequest: performSignedPaymentServerRequest,
  getAccountBalance: getAccountBalance
};
