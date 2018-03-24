import { EthAddress, PersistenceService } from "../services/PersistenceService";
import { BigNumber } from "../util/BigNumberHelper";
import { ProviderRequestCounter } from "./ProviderRequestCounter";

export class TokenStoreService {

  private store: PersistenceService;

  constructor(_store: PersistenceService) {
    this.store = _store;
  }

  async getProviderRequestCounterInfoForMediator(mediatorAddress: EthAddress, tokenId: BigNumber): Promise<ProviderRequestCounter> {
    const infoJSON = await this.store.load("providerRequestCounters-" + mediatorAddress, tokenId.toString(10));
    return ProviderRequestCounter.fromJSONObj(infoJSON);
  }

  async getConsumerRequestCounterForMediator(mediatorAddress: EthAddress, tokenId: BigNumber) {
    const info = await this.store.load("consumerRequestCounters-" + mediatorAddress, tokenId.toString(10));
    return (info && info.requestCount) ? info.requestCount : 0;
  }

  async incrementAndGetConsumerRequestCounterForMediator(mediatorAddress: EthAddress, tokenId: BigNumber) {
    return await this.store.increment("consumerRequestCounters-" + mediatorAddress, tokenId.toString(10));
  }

  async saveNewRequestCountAndSignatureForProvider(mediatorAddress: EthAddress, tokenId: BigNumber, newRequestCount: number, newSignature: string) {
    const infoJSON = await this.store.load("providerRequestCounters-" + mediatorAddress, tokenId.toString(10));
    const info = ProviderRequestCounter.fromJSONObj(infoJSON);

    info.registerCount(newRequestCount);
    info.signature = newSignature;

    await this.store.store("providerRequestCounters-" + mediatorAddress, tokenId.toString(10), info.toJSONObj());
  }

}
