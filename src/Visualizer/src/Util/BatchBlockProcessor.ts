type Placeholder = null;

// TODO: unit test this!

export default class BatchBlockProcessor<T> {

  private dataFetchingAction: (blockNumber: number) => Promise<T>;
  private dataUpdateCallback?: (datapoints: T[], labels: string[]) => void;

  constructor(
    dataFetchingAction: (blockNumber: number) => Promise<T>,
    dataUpdateCallback?: (datapoints: T[], labels: string[]) => void
  ) {
    this.dataFetchingAction = dataFetchingAction;
    this.dataUpdateCallback = dataUpdateCallback;
  }

  public async startLoading(
    fromBlockNumber: number,
    count: number,
    batchSize: number = 100
  ) {
    let datapoints = [] as T[];
    let labels = [] as string[];
    let nextBlockNumber = fromBlockNumber;

    while (nextBlockNumber > fromBlockNumber - count && nextBlockNumber >= 0) {
      let data = await this.loadBatch(nextBlockNumber, batchSize);
      datapoints = datapoints.concat(data.datapoints);
      labels = labels.concat(data.labels);
      this.sendUpdate(datapoints, labels);
      nextBlockNumber = nextBlockNumber - batchSize;
    }

    return {datapoints, labels};
  }

  private async loadBatch(fromBlockNumber: number, count: number) {
    let datapoints = [] as (T | Placeholder)[];
    let labels = [] as string[];
    let promises = [];
    let nextBlockNumber = fromBlockNumber;
    while (nextBlockNumber > fromBlockNumber - count && nextBlockNumber >= 0) {
      promises.push(this.loadDataAt(nextBlockNumber, datapoints, labels));
      nextBlockNumber = nextBlockNumber - 1;
    }
    await Promise.all(promises);
    return {datapoints: datapoints as T[], labels};
  }

  private async loadDataAt(
    blockNumber: number,
    targetDataArray: (T | Placeholder)[], targetLabelArray: string[]
  ) {
    const targetIndex = targetDataArray.length;

    targetDataArray.push(null);   // push placeholder value
    targetLabelArray.push(`${blockNumber}`);

    targetDataArray[targetIndex] = await this.dataFetchingAction(blockNumber);
  }

  private sendUpdate(datapoints: T[], labels: string[]) {
    if (this.dataUpdateCallback) {
      this.dataUpdateCallback(
        datapoints.slice(0, datapoints.length),
        labels.slice(0, datapoints.length),
      );
    }
  }
}
