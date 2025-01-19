import { Router } from 'express';
import authRoutes from './auth';
import adminRoutes from './admin';
import studentRoutes from './student';

const router = Router();

const API_PREFIX = '/api';

router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/admin`, adminRoutes);
router.use(`${API_PREFIX}/student`, studentRoutes);


export default router;
