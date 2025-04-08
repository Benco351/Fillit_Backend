import { Router } from 'express';
import * as requestedShiftController from '../controllers/requestedShiftController';
import { validate } from '../middlewares/validateMiddleware';
import { CreateRequestedShiftSchema, UpdateRequestedShiftSchema } from '../types/requestedShiftSchema';

const router = Router();

router.get('/:id', requestedShiftController.getRequestedShift);
router.get('/', requestedShiftController.getRequestedShifts);
router.post('/', validate(CreateRequestedShiftSchema), requestedShiftController.createShiftRequest);
router.delete('/:id', requestedShiftController.deleteRequestedShift); 
router.put('/:id', validate(UpdateRequestedShiftSchema), requestedShiftController.updateRequestedShift);

export default router;