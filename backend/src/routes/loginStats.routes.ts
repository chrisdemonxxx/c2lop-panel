import { Router } from 'express';
import { recordLoginEvent, getLoginStats } from '../controllers/loginStats.controller';

const router = Router();

router.post('/login-stats', recordLoginEvent);
router.get('/login-stats', getLoginStats);

export default router;
