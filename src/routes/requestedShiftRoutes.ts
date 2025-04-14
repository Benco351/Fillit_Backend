import { Router } from 'express';
import {getRequestedShiftById, getRequestedShiftsByParams, createShiftRequest, deleteRequestedShift, updateRequestedShift} from '../controllers/requestedShiftController';
import { validate, validateQuery } from '../middlewares/validateMiddleware';
import { CreateRequestedShiftSchema, UpdateRequestedShiftSchema, RequestedShiftQuerySchema } from '../types/requestedShiftSchema';

const router = Router();

router.get('/:id', getRequestedShiftById);
router.get('/',validateQuery(RequestedShiftQuerySchema), getRequestedShiftsByParams);
router.post('/', validate(CreateRequestedShiftSchema), createShiftRequest);
router.delete('/:id', deleteRequestedShift); 
router.put('/:id', validate(UpdateRequestedShiftSchema), updateRequestedShift);

export default router;