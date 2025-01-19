import { Router } from 'express';
import profileRoutes from './routes/profile.routes';
import resultRoutes from './routes/result.routes';
import statsRoutes from './routes/stats.routes';
import testRoutes from './routes/test.routes';

const router = Router();

router.use('/profile', profileRoutes);
router.use('/result', resultRoutes);
router.use('/stats', statsRoutes);
router.use('/test', testRoutes);

export default router;
