import { Request, Response, NextFunction } from 'express';
import * as departmentService from '../../../core/services/department.service';
import { CreateDepartmentDTO, UpdateDepartmentDTO, DepartmentQueryDTO } from '../../../assets/types/types';
import { apiResponse } from '../../../utils/apiResponse';
import { logger } from '../../../config/logger';
import {
  InvalidDepartmentId,
  DepartmentNotFound,
  NoDepartmentsFound,
  CreatedDepartmentLog,
  FetchedDepartmentsLog,
  GetDepartmentErrorLog,
  GetDepartmentsErrorLog,
  UpdateDepartmentErrorLog,
  CreateDepartmentErrorLog,
  DepartmentCreated,
  DepartmentDeleted,
  DepartmentUpdated
} from '../../../assets/messages/departmentMessages';
import { validateId } from '../../../middlewares/validateMiddleware';

export const createDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // if (!(req as any).user?.employee_admin) {
    //   res.status(403).json({ error: 'Only admins can create departments' });
    //   return;
    // }
    const department = await departmentService.createDepartment(req.body as CreateDepartmentDTO);
    logger.info(CreatedDepartmentLog(department.department_id));
    res.status(201).json(apiResponse(department, DepartmentCreated));
  } catch (err) {
    logger.error(CreateDepartmentErrorLog(err));
    next(err);
  }
};

export const getDepartmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = validateId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: InvalidDepartmentId });
      return;
    }
    const department = await departmentService.getDepartmentById(id);
    if (!department) {
      res.status(404).json({ error: DepartmentNotFound });
      return;
    }
    res.json(apiResponse(department));
  } catch (err) {
    logger.error(GetDepartmentErrorLog(err));
    next(err);
  }
};

export const getDepartmentsByParams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const departments = await departmentService.getDepartmentsByParams(req.query as DepartmentQueryDTO);
    if (!departments || departments.length === 0) {
      res.status(200).json(apiResponse([]));
      return;
    }
    logger.info(FetchedDepartmentsLog);
    res.json(apiResponse(departments));
  } catch (err) {
    logger.error(GetDepartmentsErrorLog(err));
    next(err);
  }
};

export const deleteDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // if (!(req as any).user?.employee_admin) {
    //   res.status(403).json({ error: 'Only admins can delete departments' });
    //   return;
    // }
    const id = validateId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: InvalidDepartmentId });
      return;
    }
    const success = await departmentService.deleteDepartment(id);
    if (!success) {
      res.status(404).json({ error: DepartmentNotFound });
      return;
    }
    res.json(apiResponse(null, DepartmentDeleted));
  } catch (err) {
    next(err);
  }
};

export const updateDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // if (!(req as any).user?.employee_admin) {
    //   res.status(403).json({ error: 'Only admins can update departments' });
    //   return;
    // }
    const id = validateId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: InvalidDepartmentId });
      return;
    }
    const department = await departmentService.updateDepartment(id, req.body as UpdateDepartmentDTO);
    if (!department) {
      res.status(404).json({ error: DepartmentNotFound });
      return;
    }
    res.json(apiResponse(department, DepartmentUpdated));
  } catch (err) {
    logger.error(UpdateDepartmentErrorLog(err));
    next(err);
  }
}; 