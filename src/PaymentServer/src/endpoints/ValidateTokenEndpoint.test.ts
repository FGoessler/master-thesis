import { MediatorListService } from "../services/MediatorListService";
import { MediatorProvider } from "../services/MediatorProvider";
import { TokenStoreService } from "../services/TokenStoreService";
import { ValidateTokenEndpoint } from "./ValidateTokenEndpoint";
import { InMemPersistenceService } from "../services/InMemPersistenceService";
import { BigNumberHelper } from "../util/BigNumberHelper";

describe("FundingService", () => {
  let endpoint: ValidateTokenEndpoint;
  let mediatorListServiceMock: MediatorListService;
  let mediatorProviderMock: MediatorProvider;
  let tokenStoreServiceMock: TokenStoreService;
  let inMemPersistenceService: InMemPersistenceService;
  const tokenId = BigNumberHelper.toBigNumber(20);

  beforeEach(() => {
    mediatorListServiceMock = <MediatorListService>{};
    mediatorProviderMock = <MediatorProvider>{};
    inMemPersistenceService = new InMemPersistenceService();
    tokenStoreServiceMock = new TokenStoreService(inMemPersistenceService);
    endpoint = new ValidateTokenEndpoint(mediatorListServiceMock, mediatorProviderMock, tokenStoreServiceMock);
  });

  describe("request count validation", () => {
    test("accepts increasing request counts", async () => {
      await endpoint._checkRequestCounter("0x1", tokenId, 1, "sig");
      await endpoint._checkRequestCounter("0x1", tokenId, 2, "sig");
      await endpoint._checkRequestCounter("0x1", tokenId, 3, "sig");
    });

    test("accepts request counts that were left out previously", async () => {
      await endpoint._checkRequestCounter("0x1", tokenId, 1, "sig");
      await endpoint._checkRequestCounter("0x1", tokenId, 3, "sig");
      await endpoint._checkRequestCounter("0x1", tokenId, 2, "sig");
      await endpoint._checkRequestCounter("0x1", tokenId, 4, "sig");
      await expect(endpoint._checkRequestCounter("0x1", tokenId, 2, "sig")).rejects.toBeDefined();
      await expect(endpoint._checkRequestCounter("0x1", tokenId, 1, "sig")).rejects.toBeDefined();
      await expect(endpoint._checkRequestCounter("0x1", tokenId, 3, "sig")).rejects.toBeDefined();
    });

    test("declines non increasing request counts", async () => {
      await endpoint._checkRequestCounter("0x1", tokenId, 1, "sig");
      await endpoint._checkRequestCounter("0x1", tokenId, 2, "sig");
      await expect(endpoint._checkRequestCounter("0x1", tokenId, 2, "sig")).rejects.toBeDefined();
      await expect(endpoint._checkRequestCounter("0x1", tokenId, 1, "sig")).rejects.toBeDefined();
      await expect(endpoint._checkRequestCounter("0x1", tokenId, 0, "sig")).rejects.toBeDefined();
    });

    test("request count is validated per token id", async () => {
      await endpoint._checkRequestCounter("0x1", tokenId, 1, "sig");
      await endpoint._checkRequestCounter("0x1", BigNumberHelper.toBigNumber(21), 1, "sig");
      await endpoint._checkRequestCounter("0x1", tokenId, 2, "sig");
      await endpoint._checkRequestCounter("0x1", BigNumberHelper.toBigNumber(21), 2, "sig");
      await expect(endpoint._checkRequestCounter("0x1", tokenId, 2, "sig")).rejects.toBeDefined();
      await expect(endpoint._checkRequestCounter("0x1", BigNumberHelper.toBigNumber(21), 2, "sig")).rejects.toBeDefined();
    });

    test("stores the signature", async () => {
      await endpoint._checkRequestCounter("0x1", tokenId, 1, "sig-1234");
      const info = await tokenStoreServiceMock.getProviderRequestCounterInfoForMediator("0x1", tokenId);
      expect(info.signature).toBe("sig-1234");
    });
  });

});

