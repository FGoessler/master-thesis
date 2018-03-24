import { Request } from "express";
import { ErrorMiddleware } from "../Server";
import { PaymentServerError } from "../errors";

export default class ErrorHandler implements ErrorMiddleware {
  handle(err: Error, req: Request, res: any, next: (err: Error) => void) {
    if (err instanceof PaymentServerError) {
      res.status((err as any).httpStatusCode);
      res.json((err as any).toObject());
    } else if (err instanceof Error) {
      console.warn("Catched non PaymentServerError object! It's preferred to throw PaymentServerError objects!");
      res.status(500);
      res.json({
        code: 0,
        name: err.name,
        message: err.message
      });
    } else {
      console.error("Catched non error object! Please only throw valid Error or PaymentServerError objects!");
      res.status(500);
      res.json(err);
    }
    next(err);
  }
}
