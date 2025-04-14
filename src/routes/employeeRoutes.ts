import { Router } from 'express';
import {getEmployeesByParams, getEmployeeById, createEmployee, deleteEmployee, updateEmployee} from '../controllers/employeeController';
import { validate } from '../middlewares/validateMiddleware';
import { CreateEmployeeSchema, UpdateEmployeeSchema } from '../types/employeeSchema';

const router = Router();

router.get('/', getEmployeesByParams);
router.get('/:id', getEmployeeById);
router.post('/', validate(CreateEmployeeSchema), createEmployee);
router.delete('/:id' , deleteEmployee); 
router.put('/:id', validate(UpdateEmployeeSchema), updateEmployee); 

export default router;