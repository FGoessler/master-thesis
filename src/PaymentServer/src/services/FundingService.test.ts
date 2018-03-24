import { FundingService } from "./FundingService";
import { PersistenceService } from "./PersistenceService";
import { FakeMediator } from "../MediatorContract/FakeMediator";
import { BigNumberHelper } from "../util/BigNumberHelper";

describe("FundingService", () => {
  let fundingService: FundingService;
  let persistenceService: PersistenceService;

  beforeEach(() => {
    persistenceService = {
      store: jest.fn(),
      del: jest.fn(),
      load: jest.fn(),
      increment: jest.fn(),
      loadTable: jest.fn(),
      loadTableKeys: jest.fn()
    };
    fundingService = new FundingService(persistenceService);
  });

  test("stores funding parameters ", async () => {
    await fundingService.saveFundingParametersForMediator("0xade42fd809c", BigNumberHelper.toBigNumber(500000), BigNumberHelper.toBigNumber(40000));

    expect(persistenceService.store).toBeCalledWith("fundingConfigsPerMediator", "0xade42fd809c", {
      refundingAmount: "500000",
      autoRefundingThreshold: "40000"
    });
  });

  describe("auto refunding", () => {
    let mediatorWrapperMock: FakeMediator;
    const serviceConsumerAddr = "0x54321fedcba";

    beforeEach(() => {
      mediatorWrapperMock = new FakeMediator();
      mediatorWrapperMock.mediatorAddress = "0x12345abcdef";
      mediatorWrapperMock.depositFunds = jest.fn();
      mediatorWrapperMock.consumer = serviceConsumerAddr;

      (<any>persistenceService.load).mockReturnValue({
        refundingAmount: "5000",
        autoRefundingThreshold: "2000"
      });
    });

    test("deposits ether when funds in mediator are BELOW the threshold", async () => {
      // given
      mediatorWrapperMock.consumerFunds = BigNumberHelper.toBigNumber(1000);

      // when
      await fundingService.checkForAutoRefunding(mediatorWrapperMock);

      // assert
      expect(persistenceService.load).toHaveBeenCalledWith("fundingConfigsPerMediator", mediatorWrapperMock.mediatorAddress);
      expect(mediatorWrapperMock.depositFunds).toHaveBeenCalledWith(serviceConsumerAddr, BigNumberHelper.toBigNumber("5000"));
    });

    test("deposits NOTHING when funds in mediator are ABOVE the threshold", async () => {
      // given
      mediatorWrapperMock.consumerFunds = BigNumberHelper.toBigNumber(3000);

      // when
      await fundingService.checkForAutoRefunding(mediatorWrapperMock);

      // assert
      expect(persistenceService.load).toHaveBeenCalledWith("fundingConfigsPerMediator", mediatorWrapperMock.mediatorAddress);
      expect(mediatorWrapperMock.depositFunds).not.toHaveBeenCalled();
    });

    test("does NOT start another deposit operation while deposit is in progress", async () => {
      // given
      mediatorWrapperMock.transactionsInProgress.depositFunds = true;
      mediatorWrapperMock.consumerFunds = BigNumberHelper.toBigNumber(1000);

      // when
      await fundingService.checkForAutoRefunding(mediatorWrapperMock);

      // assert
      expect(persistenceService.load).toHaveBeenCalledWith("fundingConfigsPerMediator", mediatorWrapperMock.mediatorAddress);
      expect(mediatorWrapperMock.depositFunds).not.toHaveBeenCalled();
    });
  });
});
