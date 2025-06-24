import { Router } from 'express';
import { loginEmployee } from '../controllers/login.controller';

const router = Router();

// POST /api/login
router.post('/', loginEmployee);

export default router; 