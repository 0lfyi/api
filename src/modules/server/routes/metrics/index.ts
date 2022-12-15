import { Request, Response } from 'express';
import auth from 'basic-auth';
import { registry } from '../../../../services/prometheus.js';
import utils from '../../../../utils/index.js';
import { Forbidden } from '../../../../errors/Http.js';

export const get = [
  utils.route(async (req: Request, res: Response) => {
    const user = auth(req);

    if (!user || user.name !== 'prometheus' || user.pass !== 'c1ec78511a7facea68d5808fe24c') {
      throw new Forbidden();
    }

    res.set('Content-Type', registry.contentType);
    res.send(await registry.metrics());
  }),
];
