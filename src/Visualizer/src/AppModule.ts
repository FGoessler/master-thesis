const Web3 = require("web3");
import BlockListService from "./BlockInspector/BlockListService";
import AddressInfoService from "./AddressInspector/AddressInfoService";
import { BalanceChartCreator } from "./AddressInspector/BalanceChartCreator";

export default class AppModule {

  public blockListService: BlockListService;
  public addressInfoService: AddressInfoService;
  public balanceChartCreator: BalanceChartCreator;

  constructor() {
    // Configure host of ETH node here:
    const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    this.blockListService = new BlockListService(web3);
    this.addressInfoService = new AddressInfoService(web3);
    this.balanceChartCreator = new BalanceChartCreator(this.addressInfoService, this.blockListService);
  }
}