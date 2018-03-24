import { Application, Request, Response } from "express";


export interface Middleware {
  handle(req: Request, res: Response, next: (err?: any) => void): void;
}

export interface ErrorMiddleware {
  handle(error: Error, req: Request, res: Response, next: (err?: any) => void): void;
}

export default class Server {
  private express: Application;

  constructor(app: Application) {
    this.express = app;
  }

  get(route: string, fn: (req: Request, res: Response) => void) {
    this.express.get(route, fn);
  }

  getAsync(route: string, endpoint: any) {
    this.express.get(route, (req, res, done) => {
      endpoint.handle.bind(endpoint)(req, res).catch(done);
    });
  }

  use(fn: any) {
    this.express.use(fn);
  }

  useMiddleware(middleware: Middleware) {
    this.express.use(middleware.handle.bind(middleware));
  }

  useErrorMiddleware(middleware: ErrorMiddleware) {
    this.express.use(middleware.handle.bind(middleware));
  }

  listen(port: number, cb: () => void) {
    this.express.listen(port, cb);
  }
}
