import { Router } from 'express';
import { getDepartmentById, getDepartmentsByParams, createDepartment, deleteDepartment, updateDepartment } from '../controllers/department.controller';
import { validate, validateQuery } from '../../../middlewares/validateMiddleware';
import { CreateDepartmentSchema, UpdateDepartmentSchema, DepartmentQuerySchema } from '../../../assets/types/types';

const router = Router();

router.get('/:id', getDepartmentById);
router.get('/', validateQuery(DepartmentQuerySchema), getDepartmentsByParams);
router.post('/', validate(CreateDepartmentSchema), createDepartment);
router.delete('/:id', deleteDepartment);
router.put('/:id', validate(UpdateDepartmentSchema), updateDepartment);

export default router; 