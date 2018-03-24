import { MediatorListService } from "./MediatorListService";
import { MediatorProvider } from "./MediatorProvider";
import { InMemPersistenceService } from "./InMemPersistenceService";
import { FakeMediator } from "../MediatorContract/FakeMediator";

describe("MediatorListService", () => {
  let mediatorProviderMock: MediatorProvider;
  let inMemPersistenceService: InMemPersistenceService;
  let mediatorListService: MediatorListService;

  beforeEach(() => {
    mediatorProviderMock = <MediatorProvider>{};
    mediatorProviderMock.getMediatorWrapperWithAddress = jest.fn();
    inMemPersistenceService = new InMemPersistenceService();
    mediatorListService = new MediatorListService(mediatorProviderMock, inMemPersistenceService);

    inMemPersistenceService.store("consumerMediatorAddresses", "0x1", 1);
    inMemPersistenceService.store("consumerMediatorAddresses", "0x2", 1);
    inMemPersistenceService.store("providerMediatorAddresses", "0x3", 1);
    inMemPersistenceService.store("providerMediatorAddresses", "0x4", 1);
  });

  test("get mediator addresses for consumer services", async () => {
    const addr = await mediatorListService.getAllKnownConsumerMediatorAddresses();
    expect(addr).toHaveLength(2);
    expect(addr).toContain("0x1");
    expect(addr).toContain("0x2");
  });

  test("get mediator addresses for providing services", async () => {
    const addr = await mediatorListService.getAllKnownProviderMediatorAddresses();
    expect(addr).toHaveLength(2);
    expect(addr).toContain("0x3");
    expect(addr).toContain("0x4");
  });

  test("get all mediator addresses", async () => {
    const addr = await mediatorListService.getAllKnownMediatorAddresses();
    expect(addr).toHaveLength(4);
    expect(addr).toContain("0x1");
    expect(addr).toContain("0x2");
    expect(addr).toContain("0x3");
    expect(addr).toContain("0x4");
  });

  test("add and remove consumer mediator addresses", async () => {
    let addr;
    addr = await mediatorListService.getAllKnownConsumerMediatorAddresses();
    expect(addr).toHaveLength(2);

    await mediatorListService.addMediatorAddressOnBehalfOfServiceConsumer("0x11");
    addr = await mediatorListService.getAllKnownConsumerMediatorAddresses();
    expect(addr).toHaveLength(3);
    expect(addr).toContain("0x11");

    await mediatorListService.removeMediatorAddressBecauseOfTermination("0x2");
    addr = await mediatorListService.getAllKnownConsumerMediatorAddresses();
    expect(addr).toHaveLength(2);
    expect(addr).not.toContain("0x2");
  });

  test("add and remove provider mediator addresses", async () => {
    let addr;
    addr = await mediatorListService.getAllKnownProviderMediatorAddresses();
    expect(addr).toHaveLength(2);

    await mediatorListService.addMediatorAddressOnBehalfOfServiceProvider("0x11");
    addr = await mediatorListService.getAllKnownProviderMediatorAddresses();
    expect(addr).toHaveLength(3);
    expect(addr).toContain("0x11");

    await mediatorListService.removeMediatorAddressBecauseOfTermination("0x4");
    addr = await mediatorListService.getAllKnownProviderMediatorAddresses();
    expect(addr).toHaveLength(2);
    expect(addr).not.toContain("0x4");
  });

  test("find mediator address for consumer/provider pair", async () => {
    const terminatedMediator = new FakeMediator();
    terminatedMediator.mediatorAddress = "0x1";
    terminatedMediator.consumer = "0x100";
    terminatedMediator.provider = "0x200";
    terminatedMediator.terminated = true;
    const mediatorForOtherServices = new FakeMediator();
    mediatorForOtherServices.mediatorAddress = "0x2";
    mediatorForOtherServices.consumer = "0x300";
    mediatorForOtherServices.provider = "0x400";
    const correctMediator = new FakeMediator();
    correctMediator.mediatorAddress = "0x3";
    correctMediator.consumer = "0x100";
    correctMediator.provider = "0x200";
    (<any>mediatorProviderMock.getMediatorWrapperWithAddress)
      .mockReturnValueOnce(terminatedMediator)
      .mockReturnValueOnce(mediatorForOtherServices)
      .mockReturnValueOnce(correctMediator);

    const mediatorAddr = await mediatorListService.getMediatorAddressForConsumerAndProviderIfExisting("0x100", "0x200");

    expect(mediatorAddr).toBe(correctMediator.mediatorAddress);
  });
});
