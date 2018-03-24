import { BigNumber } from "../Util/bigNumber";
import { Web3 } from "../Util/web3";
import { abi } from "../Util/contractAbi";
const promisify = require("util.promisify");

export interface ContractValue {
  label: string;
  value: any;
}

export default class AddressInfoService {

  private web3: Web3;

  constructor(web3: Web3) {
    this.web3 = web3;
  }

  public async getBalance(address: string): Promise<BigNumber> {
    return await promisify(this.web3.eth.getBalance.bind(this.web3.eth))(address);
  }

  public async getBalanceAt(address: string, block: number | string): Promise<BigNumber> {
    return await promisify(this.web3.eth.getBalance.bind(this.web3.eth))(address, block);
  }

  public async getContractData(address: string): Promise<ContractValue[] | undefined> {
    const MediatorContract = this.web3.eth.contract(abi);
    try {
      const contractInstance = MediatorContract.at(address);
      return await Promise.all([
        wrapContractMethod(contractInstance, "serviceConsumer"),
        wrapContractMethod(contractInstance, "serviceProvider"),
        wrapContractMethod(contractInstance, "costPerRequest"),
        wrapContractMethod(contractInstance, "serviceConsumerFunds"),
        wrapContractMethod(contractInstance, "serviceProviderFunds"),
        wrapContractMethod(contractInstance, "activeTokenId"),
        wrapContractMethod(contractInstance, "soonExpiringTokenId"),
        wrapContractMethod(contractInstance, "soonExpiringTokenIdTimeout"),
        wrapContractMethod(contractInstance, "terminationStartedAt")
      ]);
    } catch (e) {
      console.warn(e);
      return undefined;
    }
  }
}

function wrapContractMethod(contractInstance: Object, methodName: string): Promise<ContractValue> {
  return promisify(contractInstance[methodName].call)()
    .then((v: any) => {
      return {label: methodName, value: v};
    });
}