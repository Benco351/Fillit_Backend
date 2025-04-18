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

// router.get('/', tokenAuthentication, validateQuery(AssignedShiftQuerySchema), getAssignedShiftsByParams);
// router.get('/:id', tokenAuthentication, getAssignedShiftById);
// router.post('/', tokenAuthentication, validate(CreateAssignedShiftSchema), createAssignedShift);
// router.delete('/:id', tokenAuthentication, deleteAssignedShift); 


export default router;

