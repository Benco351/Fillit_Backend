import { Router } from 'express';
import { getAvailableShiftById, getAvailableShiftsByParams, createAvailableShift, deleteAvailableShift, updateAvailableShift } from '../controllers/availableShift.controller';
import { validate, validateQuery } from '../../../middlewares/validateMiddleware';
import { CreateAvailableShiftSchema, UpdateAvailableShiftSchema , AvailableShiftQuerySchema} from '../../../assets/types/types';

const router = Router();
router.get('/:id', getAvailableShiftById);
router.get('/', validateQuery(AvailableShiftQuerySchema), getAvailableShiftsByParams);
router.post('/', validate(CreateAvailableShiftSchema), createAvailableShift);
router.delete('/:id', deleteAvailableShift);
router.put('/:id', validate(UpdateAvailableShiftSchema), updateAvailableShift);


export default router; 