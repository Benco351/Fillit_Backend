import { Router } from 'express';

import { createOrganization, getOrganizations } from '../controllers/organization.controller';
import { validate } from '../../../middlewares/validateMiddleware';
import { CreateOrganizationSchema } from '../../../assets/types/types';

const router = Router();

router.post('/', validate(CreateOrganizationSchema), createOrganization);
router.get('/', getOrganizations);

export default router;