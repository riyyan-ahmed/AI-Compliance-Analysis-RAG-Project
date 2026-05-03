import { Router } from 'express';
import { qaStream, gapAnalysis } from '../controllers/analysis.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/:id/qa', qaStream);
router.post('/gap', gapAnalysis);

export default router;
