import { Router } from 'express';
import * as availableShiftController from '../controllers/availableShiftController';
import { validate } from '../middlewares/validateMiddleware';
import { CreateAvailableShiftSchema, UpdateAvailableShiftSchema } from '../types/availableShiftSchema';


const router = Router();
router.get('/:id', availableShiftController.getAvailableShift);
router.get('/', availableShiftController.getAvailableShifts);
router.post('/', validate(CreateAvailableShiftSchema), availableShiftController.createAvailableShift);
router.delete('/:id', availableShiftController.deleteAvailableShift);
router.put('/:id', validate(UpdateAvailableShiftSchema), availableShiftController.updateAvailableShift);

export default router;