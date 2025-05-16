import { Router } from 'express';
import {createEmployee} from '../controllers/employee.controller';
import { validate} from '../../../middlewares/validateMiddleware';
import { CreateEmployeeSchema} from '../../../assets/types/types';

const router = Router();

router.post('/SignUp', validate(CreateEmployeeSchema), createEmployee);

export default router;