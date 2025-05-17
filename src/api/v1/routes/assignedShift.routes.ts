import { Router } from 'express';
import { validate, validateQuery} from '../../../middlewares/validateMiddleware';
import { swapAssignedShiftsSchema ,CreateAssignedShiftSchema, AssignedShiftQuerySchema } from '../../../assets/types/types';
import { swapAssignedShifts ,getAssignedShiftsByParams, getAssignedShiftById, createAssignedShift, deleteAssignedShift } from '../controllers/assignedShift.controller';

const router = Router();

router.get('/',validateQuery(AssignedShiftQuerySchema), getAssignedShiftsByParams);
router.get('/:id', getAssignedShiftById);
router.post('/', validate(CreateAssignedShiftSchema), createAssignedShift);
router.delete('/:id', deleteAssignedShift); 
router.put('/swap', validate(swapAssignedShiftsSchema), swapAssignedShifts); // Assuming you have a swap function



export default router;

