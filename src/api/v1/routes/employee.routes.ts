import { Router } from 'express';
import {getEmployeesByParams, getEmployeeById, deleteEmployee, updateEmployee, isEmployeeExists} from '../controllers/employee.controller';
import { validate, validateQuery} from '../../../middlewares/validateMiddleware';
import { UpdateEmployeeSchema, EmployeeQuerySchema } from '../../../assets/types/types';

const router = Router();

router.get('/',validateQuery(EmployeeQuerySchema), getEmployeesByParams);
router.get('/verify/:email', isEmployeeExists); // Verify if employee exists by email
router.get('/:id', getEmployeeById);
router.delete('/:id' , deleteEmployee); 
router.put('/:id', validate(UpdateEmployeeSchema), updateEmployee); 

export default router;