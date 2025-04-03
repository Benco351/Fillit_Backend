import { Router } from 'express';
import * as availableShiftController from '../controllers/availableShiftController';
import { validate } from '../middlewares/validateMiddleware';
import { CreateAvailableShiftSchema } from '../types/availableShiftSchema';

const router = Router();

// router.get('/', availableShiftController.getAvailableShifts);
// router.post('/', validate(CreateAvailableShiftSchema), availableShiftController.createShiftSlot);
// router.delete('/:id', availableShiftController.deleteAvailableShift); // Uncommented the deleteEmployee route
// router.put('/:id', availableShiftController.updateAvailavleShift); // Added the updateEmployee route

export default router;