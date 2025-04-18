import { Router } from 'express';
import {getEmployeesByParams, getEmployeeById, createEmployee, deleteEmployee, updateEmployee} from '../controllers/employee.controller';
import { validate, validateQuery} from '../../../middlewares/validateMiddleware';
import { CreateEmployeeSchema, UpdateEmployeeSchema, EmployeeQuerySchema  } from '../../../assets/types/types';
import { tokenAuthentication } from '../../../middlewares/authMiddleware';

const router = Router();

router.get('/',validateQuery(EmployeeQuerySchema), getEmployeesByParams);
router.get('/:id', getEmployeeById);
router.post('/', validate(CreateEmployeeSchema), createEmployee);
router.delete('/:id' , deleteEmployee); 
router.put('/:id', validate(UpdateEmployeeSchema), updateEmployee); 

// router.get('/', tokenAuthentication,validateQuery(EmployeeQuerySchema), getEmployeesByParams);
// router.get('/:id', tokenAuthentication, getEmployeeById);
// router.post('/', tokenAuthentication, validate(CreateEmployeeSchema), createEmployee);
// router.delete('/:id' , tokenAuthentication, deleteEmployee); 
// router.put('/:id', tokenAuthentication, validate(UpdateEmployeeSchema), updateEmployee); 

export default router;