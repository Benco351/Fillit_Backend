import { Router } from 'express';
import { validate, validateQuery} from '../../../middlewares/validateMiddleware';
import { CreateAssignedShiftSchema, AssignedShiftQuerySchema } from '../../../assets/types/types';
import { getAssignedShiftsByParams, getAssignedShiftById, createAssignedShift, deleteAssignedShift } from '../controllers/assignedShift.controller';
import { tokenAuthentication } from '../../../middlewares/authMiddleware';

const router = Router();

router.get('/',validateQuery(AssignedShiftQuerySchema), getAssignedShiftsByParams);
router.get('/:id', getAssignedShiftById);
router.post('/', validate(CreateAssignedShiftSchema), createAssignedShift);
router.delete('/:id', deleteAssignedShift); 



export default router;

