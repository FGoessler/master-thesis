import { Request, Response } from "express";
import { MediatorProvider } from "../services/MediatorProvider";
import { TokenStoreService } from "../services/TokenStoreService";
import { beNonEmptyString } from "../util/preconditions";
const sig = require("../util/signatureHelper");
const ethUtil = require("ethereumjs-util");

export default class SignRequestEndpoint {
  private mediatorProvider: MediatorProvider;
  private tokenStoreService: TokenStoreService;

  constructor(_mediatorProvider: MediatorProvider, _tokenStoreService: TokenStoreService) {
    this.mediatorProvider = _mediatorProvider;
    this.tokenStoreService = _tokenStoreService;
  }

  async handle(req: Request, res: Response) {
    const launchTime = parseInt(req.header("x-launch-time") || "0");
    console.log("SIGN_REQUEST_WAITED " + (new Date().getTime() - launchTime) + "ms");
    const id = Math.random();
    console.time("SIGN_REQUEST_DURATION_" + id);

    const senderAddress = beNonEmptyString(req.header("x-pay-sender"));
    const mediatorAddress = beNonEmptyString(req.params.mediatorAddress);
    const privateKey = beNonEmptyString(req.query.privateKey);

    const mediatorWrapper = this.mediatorProvider.getMediatorWrapperWithAddress(mediatorAddress);

    const activeTokenId = (await mediatorWrapper.getActiveTokenId());
    const reqCount = await this.tokenStoreService.incrementAndGetConsumerRequestCounterForMediator(mediatorAddress, activeTokenId);

    console.time("SIGN_REQUEST_PLAIN_SIG_CREATE_DURATION_" + id);
    const payloadHash = sig.solidityHash(
      ["address", "uint", "address", "uint"],
      [ethUtil.toBuffer(senderAddress), activeTokenId.toString(10), ethUtil.toBuffer(mediatorAddress), reqCount]
    );
    const signature = sig.createSignature(payloadHash, privateKey);
    console.timeEnd("SIGN_REQUEST_PLAIN_SIG_CREATE_DURATION_" + id);

    res.json({
      "x-pay-sender": senderAddress,
      "x-pay-signature": signature,
      "x-pay-mediator": mediatorAddress,
      "x-pay-token-id": activeTokenId.toString(10),
      "x-pay-req-count": reqCount.toString()
    });
    console.timeEnd("SIGN_REQUEST_DURATION_" + id);
  }

}
