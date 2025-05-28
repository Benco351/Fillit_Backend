import { Router } from 'express';
import {getEmployeesByParams, getEmployeeById, deleteEmployee, updateEmployee, isEmployeeExists, assignAdmin} from '../controllers/employee.controller';
import { validate, validateQuery} from '../../../middlewares/validateMiddleware';
import { UpdateEmployeeSchema, EmployeeQuerySchema, AssignAdminSchema } from '../../../assets/types/types';

const router = Router();

router.get('/',validateQuery(EmployeeQuerySchema), getEmployeesByParams);
router.get('/verify/:email', isEmployeeExists); // Verify if employee exists by email
router.get('/:id', getEmployeeById);
router.delete('/:id' , deleteEmployee); 
router.put('/:id', validate(UpdateEmployeeSchema), updateEmployee); 
router.put('/assign_admin/:id',validate(AssignAdminSchema), assignAdmin); 

export default router;