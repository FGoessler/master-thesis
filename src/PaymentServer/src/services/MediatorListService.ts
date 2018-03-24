import { EthAddress, PersistenceService } from "./PersistenceService";
import { MediatorProvider } from "../services/MediatorProvider";

export class MediatorListService {
  private mediatorProvider: MediatorProvider;
  private store: PersistenceService;

  constructor(_mediatorProvider: MediatorProvider, _store: PersistenceService) {
    this.mediatorProvider = _mediatorProvider;
    this.store = _store;
  }

  async getAllKnownMediatorAddresses(): Promise<EthAddress[]> {
    const consumerMediatorAddresses = new Set(await this.store.loadTableKeys("consumerMediatorAddresses"));
    const providerMediatorAddresses = new Set(await this.store.loadTableKeys("providerMediatorAddresses"));
    for (const addr of providerMediatorAddresses) {
      consumerMediatorAddresses.add(addr);
    }
    return Array.from(consumerMediatorAddresses);
  }

  async getAllKnownConsumerMediatorAddresses(): Promise<EthAddress[]> {
    return await this.store.loadTableKeys("consumerMediatorAddresses");
  }

  async getAllKnownProviderMediatorAddresses(): Promise<EthAddress[]> {
    return await this.store.loadTableKeys("providerMediatorAddresses");
  }

  async addMediatorAddressOnBehalfOfServiceConsumer(mediatorAddress: EthAddress): Promise<void> {
    await this.store.store("consumerMediatorAddresses", mediatorAddress, 1);
  }

  async addMediatorAddressOnBehalfOfServiceProvider(mediatorAddress: EthAddress): Promise<void> {
    await this.store.store("providerMediatorAddresses", mediatorAddress, 1);
  }

  async removeMediatorAddressBecauseOfTermination(mediatorAddress: EthAddress): Promise<void> {
    await Promise.all([
      this.store.del("consumerMediatorAddresses", mediatorAddress),
      this.store.del("providerMediatorAddresses", mediatorAddress)
    ]);
  }

  async getMediatorAddressForConsumerAndProviderIfExisting(serviceConsumer: EthAddress, serviceProvider: EthAddress): Promise<EthAddress | undefined> {
    const allKnownMediatorAddresses = await this.getAllKnownMediatorAddresses();
    for (const address of allKnownMediatorAddresses) {
      const mediatorWrapper = this.mediatorProvider.getMediatorWrapperWithAddress(address);
      if (await mediatorWrapper.getServiceConsumer() === serviceConsumer) {
        if (await mediatorWrapper.getServiceProvider() === serviceProvider) {
          if (!(await mediatorWrapper.getTerminated())) {
            return mediatorWrapper.mediatorAddress;
          }
        }
      }
    }
    return undefined;
  }
}
