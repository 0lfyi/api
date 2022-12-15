import { Router } from 'express';
import routes from '../routes/index.js';

const router = Router();

router.get('/metrics', routes.metrics.get);

export default router;
