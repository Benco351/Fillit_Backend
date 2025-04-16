import { Router } from 'express';
import {getRequestedShiftById, getRequestedShiftsByParams, createShiftRequest, deleteRequestedShift, updateRequestedShift} from '../controllers/requestedShiftController';
import { validate, validateQuery } from '../middlewares/validateMiddleware';
import { CreateRequestedShiftSchema, UpdateRequestedShiftSchema, RequestedShiftQuerySchema } from '../types/requestedShiftSchema';
import { tokenAuthentication } from '../middlewares/authMiddlewares';

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