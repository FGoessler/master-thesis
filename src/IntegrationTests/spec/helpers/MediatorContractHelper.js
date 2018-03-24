const fs = require("fs");
const util = require("util");
const solc = require("solc");
const config = require("../../config");
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereumNodeBaseURL));

let source = fs.readFileSync('./Mediator.sol', 'utf8');
let cachedCompiledContract = solc.compile(source, 1).contracts[':Mediator'];

function getMediatorContract() {
  let abi = cachedCompiledContract.interface;
  return web3.eth.contract(JSON.parse(abi));
}

class MediatorContractHelper {

  constructor(mediatorAddress) {
    this.mediatorContract = getMediatorContract().at(mediatorAddress);
    this.mediatorContract.Error(function(error, result) {
      if (!error) {
        console.error(result);
      }
    });
  }

  getServiceConsumer() {
    return util.promisify(this.mediatorContract.serviceConsumer.call)();
  };

  getServiceProvider() {
    return util.promisify(this.mediatorContract.serviceProvider.call)();
  };

  getActiveTokenId() {
    return util.promisify(this.mediatorContract.activeTokenId.call)();
  };

  getSoonExpiringTokenId() {
    return util.promisify(this.mediatorContract.soonExpiringTokenId.call)();
  };

  getSoonExpiringTokenIdTimeout() {
    return util.promisify(this.mediatorContract.soonExpiringTokenIdTimeout.call)();
  };

  getTerminationStartedAt() {
    return util.promisify(this.mediatorContract.terminationStartedAt.call)();
  }

  getTerminationTimeout() {
    return util.promisify(this.mediatorContract.terminationTimeout.call)();
  }

  getTerminated() {
    return util.promisify(this.mediatorContract.terminated.call)();
  }

  getCostPerRequest() {
    return util.promisify(this.mediatorContract.costPerRequest.call)();
  }

  getServiceConsumerFunds() {
    return util.promisify(this.mediatorContract.serviceConsumerFunds.call)();
  }

  getServiceProviderFunds() {
    return util.promisify(this.mediatorContract.serviceProviderFunds.call)();
  }

  getTokenRedemptionTimeout() {
    return util.promisify(this.mediatorContract.tokenRedemptionTimeout.call)();
  }
}

module.exports = MediatorContractHelper;
