let http = require('http');
let sig = require("./signatureHelper");

/**
 * Small wrapper around the default node.js http module.
 *
 * Options example:
 * const options = {
 *   hostname: 'www.google.com',
 *   port: 80,
 *   path: '/upload',
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/x-www-form-urlencoded',
 *     'Content-Length': Buffer.byteLength(postData)
 *   }
 * };
 */
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
  if(!object) {
    return new Error("HTTP Error - No specific error in body.");
  }
  let error = new Error(object.message ? object.message : "No error description");
  error.name = object.name;
  error.code = object.code;
  error.metadata = object.metadata;
  if (object.underlyingError) {
    error.underlyingError = objectToError(object.underlyingError);
  }
  return error;
}

/**
 * Sends a signed GET request to the payment server.
 */
function signedPaymentServerRequest(config, pathAndQueryString) {

  let signedPayload = config.address + pathAndQueryString;
  let signature = sig.createSignature(signedPayload, config.privateKey);

  return request({
    protocol: config.paymentServer.protocol,
    hostname: config.paymentServer.hostname,
    port: config.paymentServer.port,
    method: 'GET',
    path: pathAndQueryString,
    headers: {
      "x-pay-sender": config.address,
      "x-pay-signature": signature,
      "x-launch-time": new Date().getTime()
    }
  });
}

module.exports = {
  request: request,
  signedPaymentServerRequest: signedPaymentServerRequest
};
