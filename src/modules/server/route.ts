import { Request, Response, RequestHandler, NextFunction } from 'express';

type Handler = (req: Request, res: Response) => Promise<void>;

const route = (handler: Handler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res).catch(next);
  };
};

export default route;
