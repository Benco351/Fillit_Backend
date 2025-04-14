import { Router } from 'express';
import { validate, validateQuery} from '../middlewares/validateMiddleware';
import { CreateAssignedShiftSchema, AssignedShiftQuerySchema } from '../types/assignedShiftSchema';
import { getAssignedShiftsByParams, getAssignedShiftById, createAssignedShift, deleteAssignedShift } from '../controllers/assignedShiftController';

const router = Router();

router.get('/',validateQuery(AssignedShiftQuerySchema), getAssignedShiftsByParams);
router.get('/:id', getAssignedShiftById);
router.post('/', validate(CreateAssignedShiftSchema), createAssignedShift);
router.delete('/:id', deleteAssignedShift); 

export default router;

