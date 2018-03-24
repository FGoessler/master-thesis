import Logger from "../util/Logger";

export default class MediatorCompiler {
  private web3: any;
  private fs: any;
  private cachedCompiledContract?: any = undefined;

  constructor(web3: any, fs: any) {
    this.web3 = web3;
    this.fs = fs;
  }

  compileMediatorContract() {
    Logger.log("Compiling contract...");
    const source = this.fs.readFileSync("./dist/MediatorContract/Mediator.sol", "utf8");
    const solc = require("solc");
    this.cachedCompiledContract = solc.compile(source, 1).contracts[":Mediator"];

    Logger.log("Estimating gas cost of contract...");
    const costs = this.web3.eth.estimateGas({data: "0x" + this.cachedCompiledContract.bytecode});
    Logger.warn("Gas cost of contract: " + costs.toString(10));
  }

  getCompiledContract() {
    if (!this.cachedCompiledContract) {
      this.compileMediatorContract();
    } else {
      Logger.log("Using cached contract.");
    }
    return this.cachedCompiledContract;
  }

  getMediatorContract() {
    const abi = this.getCompiledContract().interface;
    return this.web3.eth.contract(JSON.parse(abi));
  }
}
