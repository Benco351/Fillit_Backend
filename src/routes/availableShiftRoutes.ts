import { Router } from 'express';
import { getAvailableShiftById, getAvailableShiftsByParams, createAvailableShift, deleteAvailableShift, updateAvailableShift } from '../controllers/availableShiftController';
import { validate, validateQuery } from '../middlewares/validateMiddleware';
import { CreateAvailableShiftSchema, UpdateAvailableShiftSchema , AvailableShiftQuerySchema} from '../types/availableShiftSchema';


const router = Router();
router.get('/:id', getAvailableShiftById);
router.get('/', validateQuery(AvailableShiftQuerySchema), getAvailableShiftsByParams);
router.post('/', validate(CreateAvailableShiftSchema), createAvailableShift);
router.delete('/:id', deleteAvailableShift);
router.put('/:id', validate(UpdateAvailableShiftSchema), updateAvailableShift);

export default router; 