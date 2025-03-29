import { Router } from 'express';
import * as requestedShiftController from '../controllers/requestedShiftController';
import { validate } from '../middlewares/validateMiddleware';
import { CreateRequestedShiftSchema } from '../types/requestedShiftSchema';

const router = Router();

router.get('/', requestedShiftController.getRequestedShifts);
router.post('/', validate(CreateRequestedShiftSchema), requestedShiftController.createShiftRequest);
router.delete('/:id', requestedShiftController.deleteShiftRequested); // Uncommented the deleteUser route

export default router;