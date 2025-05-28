import { Router } from 'express';
import { assignAdmin} from '../controllers/employee.controller';
import { validate } from '../../../middlewares/validateMiddleware';
import { AssignAdminSchema } from '../../../assets/types/types';


const router = Router();

router.put('/assign/:id',validate(AssignAdminSchema), assignAdmin); 

export default router;