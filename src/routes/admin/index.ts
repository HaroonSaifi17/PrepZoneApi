import { Router } from 'express';
import pdfRoutes from './routes/pdf.routes';
import testRoutes from './routes/test.routes';
import studentRoutes from './routes/student.routes';
import dashboardRoutes from './routes/dashboard.routes';
import questionRoutes from './routes/question'
const router = Router();

router.use("pdf",pdfRoutes);
router.use("test",testRoutes);
router.use("student",studentRoutes)
router.use("dashboard",dashboardRoutes);
router.use("question",questionRoutes);

export default router;
