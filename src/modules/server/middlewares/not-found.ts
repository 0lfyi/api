import { Request, Response, NextFunction } from 'express';
import { NotFound } from '../../../errors/Http.js';

const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new NotFound());
};

export default notFound;
