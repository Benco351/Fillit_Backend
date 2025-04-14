import { Router } from 'express';
import { validate } from '../middlewares/validateMiddleware';
import { CreateAssignedShiftSchema } from '../types/assignedShiftSchema';
import { getAssignedShiftsByParams, getAssignedShiftById, createAssignedShift, deleteAssignedShift } from '../controllers/assignedShiftController';

const router = Router();

router.get('/', getAssignedShiftsByParams);
router.get('/:id', getAssignedShiftById);
router.post('/', validate(CreateAssignedShiftSchema), createAssignedShift);
router.delete('/:id', deleteAssignedShift); 

export default router;

