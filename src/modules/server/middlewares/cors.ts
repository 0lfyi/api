import { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction): void => {
  const accessControlRequestHeaders = req.headers['access-control-request-headers'];
  if (accessControlRequestHeaders) {
    res.set('Access-Control-Allow-Headers', accessControlRequestHeaders);
  }

  const accessControlRequestMethod = req.headers['access-control-request-method'];
  if (accessControlRequestMethod) {
    res.set('Access-Control-Allow-Methods', accessControlRequestMethod);
  }

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Cache-Control', 'no-store');
  res.set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');

  if (req.method === 'OPTIONS') {
    res.status(204);
    res.end();
  } else {
    next();
  }
};
