import { Router } from 'express';
import { createEmployee, addToGroup } from '../controllers/auth.controller';
import { validate} from '../../../middlewares/validateMiddleware';
import { CreateEmployeeSchema, AddtoGroupSchema } from '../../../assets/types/types';

const router = Router();

router.post('/sign-up', validate(CreateEmployeeSchema), createEmployee);
router.post('/add-to-group', validate(AddtoGroupSchema), addToGroup);

export default router;