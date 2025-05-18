import { Router } from 'express';
import { createEmployee } from '../controllers/auth.controller';
import { validate} from '../../../middlewares/validateMiddleware';
import { CreateEmployeeSchema } from '../../../assets/types/types';

const router = Router();

router.post('/', validate(CreateEmployeeSchema), createEmployee);


export default router;