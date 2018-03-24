// Log parsing inspired by: https://github.com/barkthins/ether-pudding/blob/master/index.js#L23 and the related stack
// overflow post: https://ethereum.stackexchange.com/questions/1381/how-do-i-parse-the-transaction-receipt-log-with-web3-js

const SolidityEvent = require("web3/lib/web3/event.js");

function toAscii(hex) {
  let str = '',
    i = 0,
    l = hex.length;
  if (hex.substring(0, 2) === '0x') {
    i = 2;
  }
  for (; i < l; i+=2) {
    let code = parseInt(hex.substr(i, 2), 16);
    if (code === 0) continue; // this is added
    str += String.fromCharCode(code);
  }
  return str;
}

function logParser(logs, abi) {

  let decoders = abi.filter(function (json) {
    return json.type === 'event';
  }).map(function(json) {
    return new SolidityEvent(null, json, null);
  });

  return logs.map(function (log) {
    let decoder = decoders.find(function(decoder) {
      return (decoder.signature() === log.topics[0].replace("0x",""));
    });
    if (decoder) {
      return decoder.decode(log);
    } else {
      return log;
    }
  }).map(function (log) {
    abis = abi.find(function(json) {
      return (json.type === 'event' && log.event === json.name);
    });
    if (abis && abis.inputs) {
      abis.inputs.forEach(function (param, i) {
        if (param.type === 'bytes32') {
          log.args[param.name] = toAscii(log.args[param.name]);
        }
      })
    }
    return log;
  })
}

module.exports = logParser;
