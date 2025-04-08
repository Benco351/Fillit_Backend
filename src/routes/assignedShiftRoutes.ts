import { Router } from 'express';
import * as assignedShiftController from '../controllers/assignedShiftController';
import { validate } from '../middlewares/validateMiddleware';
import { CreateAssignedShiftSchema } from '../types/assignedShiftSchema';

const router = Router();

router.get('/', assignedShiftController.getAssignedShifts);
router.get('/:id', assignedShiftController.getAssignedShift);
router.post('/', validate(CreateAssignedShiftSchema), assignedShiftController.createAssignedShift);
router.delete('/:id', assignedShiftController.deleteAssignedShift); 

export default router;

