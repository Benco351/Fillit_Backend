import { Router } from 'express';
import { validate, validateQuery} from '../middlewares/validateMiddleware';
import { CreateAssignedShiftSchema, AssignedShiftQuerySchema } from '../types/assignedShiftSchema';
import { getAssignedShiftsByParams, getAssignedShiftById, createAssignedShift, deleteAssignedShift } from '../controllers/assignedShiftController';
import { tokenAuthentication } from '../middlewares/authMiddlewares';

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

