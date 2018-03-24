let http = require('http');

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
  let error = new Error(object.message);
  error.name = object.name;
  error.code = object.code;
  error.metadata = object.metadata;
  if (object.underlyingError) {
    error.underlyingError = objectToError(object.underlyingError);
  }
  return error;
}

module.exports = {
  request: request
};
