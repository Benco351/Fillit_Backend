import { Router } from 'express';
import { getAvailableShiftById, getAvailableShiftsByParams, createAvailableShift, deleteAvailableShift, updateAvailableShift } from '../controllers/availableShiftController';
import { validate } from '../middlewares/validateMiddleware';
import { CreateAvailableShiftSchema, UpdateAvailableShiftSchema } from '../types/availableShiftSchema';


const router = Router();
router.get('/:id', getAvailableShiftById);
router.get('/', getAvailableShiftsByParams);
router.post('/', validate(CreateAvailableShiftSchema), createAvailableShift);
router.delete('/:id', deleteAvailableShift);
router.put('/:id', validate(UpdateAvailableShiftSchema), updateAvailableShift);

export default router; 