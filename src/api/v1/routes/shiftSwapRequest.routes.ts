import { Router } from 'express';
import { createShiftSwapRequest, listShiftSwapRequests, respondToShiftSwapRequest } from '../controllers/shiftSwapRequest.controller';
import { validate, validateQuery } from '../../../middlewares/validateMiddleware';
import { CreateShiftSwapRequestSchema, RespondShiftSwapRequestSchema, ShiftSwapRequestQuerySchema } from '../../../assets/types/types';

const router = Router();

router.post('/', validate(CreateShiftSwapRequestSchema), createShiftSwapRequest);
router.get('/', validateQuery(ShiftSwapRequestQuerySchema), listShiftSwapRequests);
router.post('/:id/respond', validate(RespondShiftSwapRequestSchema), respondToShiftSwapRequest);

export default router; 