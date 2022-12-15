import { Request, Response, NextFunction } from 'express';
import isIpPrivate from 'private-ip';
import morgan from 'morgan';
import logger from '../../../logger.js';

const format = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

const morganLogger = morgan(format, {
  stream: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    write: (meta: any): void => {
      logger.info(meta);
    },
  },
});

const middleware = (req: Request, res: Response, next: NextFunction) => {
  if (isIpPrivate(req.ip)) {
    const userAgent = req.headers['user-agent'];
    if (req.path === '/metrics' && userAgent && userAgent.indexOf('Prometheus/') === 0) {
      next();
      return;
    }
  }
  morganLogger(req, res, next);
};

export default middleware;
