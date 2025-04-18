import { Router } from 'express';
import {getRequestedShiftById, getRequestedShiftsByParams, createShiftRequest, deleteRequestedShift, updateRequestedShift} from '../controllers/requestedShift.controller';
import { validate, validateQuery } from '../../../middlewares/validateMiddleware';
import { CreateRequestedShiftSchema, UpdateRequestedShiftSchema, RequestedShiftQuerySchema } from '../../../assets/types/types';
import { tokenAuthentication } from '../../../middlewares/authMiddleware';

const router = Router();

router.get('/:id', getRequestedShiftById);
router.get('/',validateQuery(RequestedShiftQuerySchema), getRequestedShiftsByParams);
router.post('/', validate(CreateRequestedShiftSchema), createShiftRequest);
router.delete('/:id', deleteRequestedShift); 
router.put('/:id', validate(UpdateRequestedShiftSchema), updateRequestedShift);

// router.get('/:id', tokenAuthentication, getRequestedShiftById);
// router.get('/', tokenAuthentication, validateQuery(RequestedShiftQuerySchema), getRequestedShiftsByParams);
// router.post('/', tokenAuthentication,validate(CreateRequestedShiftSchema), createShiftRequest);
// router.delete('/:id', tokenAuthentication, deleteRequestedShift); 
// router.put('/:id', tokenAuthentication, validate(UpdateRequestedShiftSchema), updateRequestedShift);


export default router;