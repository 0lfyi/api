import { Request, Response, RequestHandler, NextFunction } from 'express';

type Handler = (req: Request, res: Response) => Promise<void> | void;

const route = (handler: Handler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const prom = handler(req, res);
      if (prom) {
        prom.catch(next);
      }
    } catch (err) {
      next(err);
    }
  };
};

export default route;
