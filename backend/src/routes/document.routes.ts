import { Router } from 'express';
import {
  uploadDocument,
  listDocuments,
  getDocument,
  triggerAnalysis,
  deleteDocument,
} from '../controllers/document.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', listDocuments);
router.post('/upload', uploadMiddleware.single('file'), uploadDocument);
router.get('/:id', getDocument);
router.post('/:id/analyze', triggerAnalysis);
router.delete('/:id', deleteDocument);

export default router;
