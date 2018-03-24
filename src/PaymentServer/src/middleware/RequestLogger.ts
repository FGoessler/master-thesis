import { Request } from "express";
import Logger from "../util/Logger";
import { Middleware } from "../Server";

let counter = 0;

export default class RequestLogger implements Middleware {
  handle(req: Request, res: any, next: () => void) {
    const requestId = counter++;
    Logger.log(`${req.method} [${requestId}] - ${req.originalUrl}`);

    const rEnd = res.end;
    res.end = function (chunk: any, encoding: any, callback: any) {
      Logger.log(`RESPONSE for ${req.method} [${requestId}] - ${req.originalUrl}:\n ${chunk.toString("utf8")}`);
      rEnd.apply(this, arguments);
    };

    next();
  }
}
