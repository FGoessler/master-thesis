import AddressInfoService from "./AddressInfoService";
import BlockListService from "../BlockInspector/BlockListService";
import { BigNumberHelper } from "../Util/bigNumber";
import BatchBlockProcessor from "../Util/BatchBlockProcessor";

export interface ChartData {
  datapoints: number[];
  labels: string[];
  label: string;
  latestBlockNr: number;
  oldestBlockNr: number;
}

export class BalanceChartCreator {

  /// Can be called multiple times.
  public newChartDataCallback: (address: string, data: ChartData) => void;

  private addressInfoService: AddressInfoService;
  private blocklistService: BlockListService;

  constructor(addressInfoService: AddressInfoService, blocklistService: BlockListService) {
    this.addressInfoService = addressInfoService;
    this.blocklistService = blocklistService;
  }

  public async getChartDataStartingWithLatestBlock(address: string) {
    const latestBlock = await this.blocklistService.getBlock("latest");
    return this.getChartDataStartingWith(address, latestBlock.number);
  }

  public async getChartDataStartingWith(address: string, firstBlockNumber: number) {
    const dataFetchingAction = async (blockNumber: number) => {
      const balance = await this.addressInfoService.getBalanceAt(address, blockNumber);
      return BigNumberHelper.fromWei(balance, "nanoether").toNumber();
    };
    const dataUpdateCallback = (datapoints: number[], labels: string[]) => {
      this.newChartDataCallback(address, {
        datapoints: datapoints.slice(0, datapoints.length - 1),
        labels: labels.slice(0, datapoints.length - 1),
        label: address,
        latestBlockNr: parseInt(labels[0], 10),
        oldestBlockNr: parseInt(labels[labels.length - 1], 10)
      });
    };
    const batchProcessor = new BatchBlockProcessor<number>(dataFetchingAction, dataUpdateCallback);

    return batchProcessor.startLoading(firstBlockNumber, 2000);
  }

}
