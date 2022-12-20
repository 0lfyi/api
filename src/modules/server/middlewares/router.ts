import { Router } from 'express';
import routes from '../routes/index.js';

const router = Router();

router.get('/metrics', routes.metrics.get);
router.get('/avg-gas-cost', routes.avgGasCost.get);

export default router;
