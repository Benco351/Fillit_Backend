import { Router } from 'express';
import {getRequestedShiftById, getRequestedShiftsByParams, createShiftRequest, deleteRequestedShift, updateRequestedShift} from '../controllers/requestedShift.controller';
import { validate, validateQuery } from '../../../middlewares/validateMiddleware';
import { CreateRequestedShiftSchema, UpdateRequestedShiftSchema, RequestedShiftQuerySchema } from '../../../assets/types/types';

const router = Router();

router.get('/:id', getRequestedShiftById);
router.get('/',validateQuery(RequestedShiftQuerySchema), getRequestedShiftsByParams);
router.post('/', validate(CreateRequestedShiftSchema), createShiftRequest);
router.delete('/:id', deleteRequestedShift); 
router.put('/:id', validate(UpdateRequestedShiftSchema), updateRequestedShift);


export default router;