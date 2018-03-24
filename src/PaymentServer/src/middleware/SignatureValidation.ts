import { Middleware } from "../Server";
import { Request, Response } from "express";
import Logger from "../util/Logger";
import { MissingSenderError, MissingSignatureError, RequestSignatureInvalidError } from "../errors";
const url = require("url");
const sig = require("../util/signatureHelper");

export default class SignatureValidation implements Middleware {

  public enforceSignedIncomingRequests: boolean = true;

  constructor(enforceSignedIncomingRequests: boolean) {
    this.enforceSignedIncomingRequests = enforceSignedIncomingRequests;
  }

  handle(req: Request, res: Response, next: (err?: any) => void) {
    // Whitelisted endpoints that can be used without valid signatures.
    if (req.path === "/status" || !this.enforceSignedIncomingRequests) {
      next();
      return;
    }

    const id = Math.random();
    console.time("INC_SignatureValidation_Time_" + id);

    // get relevant header fields
    const senderAddress = req.header("x-pay-sender");
    const signature = req.header("x-pay-signature");

    if (!signature || typeof signature !== "string" || !signature.length) {
      if (this.enforceSignedIncomingRequests) {
        next(new MissingSignatureError(req.path));
        return;
      } else {
        Logger.warn("Got request without signature, but signature validation is OFF!");
        next();
        return;
      }
    }
    if (!senderAddress || typeof senderAddress !== "string" || !senderAddress.length) {
      next(new MissingSenderError(req.path));
      return;
    }

    // validate signature
    const pathAndQueryString = url.parse(req.originalUrl, false).path;
    const hash = sig.simpleHash(senderAddress + pathAndQueryString);
    const isValidSignature = sig.verifySignature(hash, signature, senderAddress);
    console.timeEnd("INC_SignatureValidation_Time_" + id);
    if (!isValidSignature) {
      if (this.enforceSignedIncomingRequests) {
        next(new RequestSignatureInvalidError(req.path));
      } else {
        Logger.warn("Got request with invalid signature, but signature validation is OFF!");
        next();
      }
    } else {
      next();
    }
  }
}
