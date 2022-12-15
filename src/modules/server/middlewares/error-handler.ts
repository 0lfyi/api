/* eslint-disable @typescript-eslint/no-unused-vars */

import { Request, Response, NextFunction } from 'express';
import HTTPError from '../../../errors/Http.js';
import logger from '../../../logger.js';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error(err);

  if (err instanceof HTTPError) {
    res.status(err.code);
    res.set('Content-Type', err.contentType);
    res.send(err.message);
    return;
  }

  logger.error('Error', err);

  res.status(500);
  res.send('Internal error');
};

export default errorHandler;
