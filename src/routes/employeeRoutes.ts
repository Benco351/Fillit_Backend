import { Router } from 'express';
import * as employeeController from '../controllers/employeeController';
import { validate } from '../middlewares/validateMiddleware';
import { CreateEmployeeSchema } from '../types/employeeSchema';

const router = Router();

router.get('/', employeeController.getEmployees);
router.get('/:id', employeeController.getEmployee);
router.post('/', validate(CreateEmployeeSchema), employeeController.createEmployee);
router.delete('/:id', employeeController.deleteEmployee); 
router.put('/:id', employeeController.updateEmployee); 

export default router;