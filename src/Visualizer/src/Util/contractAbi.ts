export const abi = [{
  "constant": false,
  "inputs": [],
  "name": "finalizeCloseThroughServiceConsumer",
  "outputs": [],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "terminated",
  "outputs": [{"name": "", "type": "bool"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "serviceConsumer",
  "outputs": [{"name": "", "type": "address"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "tokenRedemptionTimeout",
  "outputs": [{"name": "", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"name": "numRequests", "type": "uint256"}, {"name": "hash", "type": "bytes32"}, {
    "name": "v",
    "type": "uint8"
  }, {"name": "r", "type": "bytes32"}, {"name": "s", "type": "bytes32"}],
  "name": "redeemToken",
  "outputs": [],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [{"name": "", "type": "uint256"}],
  "name": "redeemedTokenIds",
  "outputs": [{"name": "", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": false,
  "inputs": [],
  "name": "payoutForServiceProvider",
  "outputs": [],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "terminationTimeout",
  "outputs": [{"name": "", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": false,
  "inputs": [],
  "name": "closeThroughServiceProvider",
  "outputs": [],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "soonExpiringTokenId",
  "outputs": [{"name": "", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "terminationStartedAt",
  "outputs": [{"name": "", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "serviceProvider",
  "outputs": [{"name": "", "type": "address"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "costPerRequest",
  "outputs": [{"name": "", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"name": "newTokenID", "type": "uint256"}],
  "name": "startTokenRedemption",
  "outputs": [],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "serviceConsumerFunds",
  "outputs": [{"name": "", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "serviceProviderFunds",
  "outputs": [{"name": "", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "soonExpiringTokenIdTimeout",
  "outputs": [{"name": "", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "activeTokenId",
  "outputs": [{"name": "", "type": "uint256"}],
  "payable": false,
  "type": "function"
}, {
  "constant": false,
  "inputs": [],
  "name": "startCloseThroughServiceConsumer",
  "outputs": [],
  "payable": false,
  "type": "function"
}, {
  "constant": false,
  "inputs": [],
  "name": "depositForServiceConsumer",
  "outputs": [],
  "payable": true,
  "type": "function"
}, {
  "inputs": [{"name": "_serviceProvider", "type": "address"}, {
    "name": "_initialTokenId",
    "type": "uint256"
  }, {"name": "_costPerRequest", "type": "uint256"}, {
    "name": "_terminationTimeout",
    "type": "uint256"
  }, {"name": "_tokenRedemptionTimeout", "type": "uint256"}], "payable": false, "type": "constructor"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "name": "code", "type": "uint8"}],
  "name": "Error",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "name": "sum", "type": "uint256"}],
  "name": "Redeemed",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "name": "sum", "type": "uint256"}],
  "name": "Payout",
  "type": "event"
}];
