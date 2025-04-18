import { Request, Response, NextFunction } from 'express';
import * as assignedShiftService from '../services/assignedShiftService';
import { CreateAssignedShiftDTO, AssignedShiftQueryDTO} from '../types/assignedShiftSchema';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';
import { AssignedShift, AvailableShift, Employee, RequestedShift } from '../config/postgres/models';
import { RequestStatus } from '../config/postgres/models/requestedShift.model';
import { validateId } from '../middlewares/validateMiddleware';
import {
  EmployeeNotFound,
  InvalidEmployeeIdStart
} from '../assets/messages/employeeMessages';
import {
  InvalidAssignedShiftId,
  InvalidShiftAssignId,
  AvailableShiftNotFound,
  AssignedShiftAlreadyExists,
  AssignedShiftNotFound,
  AssignedShiftMissing,
  NoAssignedShiftsFound,
  CreatedAssignedShiftLog,
  FetchedAssignedShiftsLog,
  GetAssignedShiftsErrorLog,
  CreateAssignedShiftErrorLog,
  AssignedShiftCreated,
  AssignedShiftDeleted,
  AssignedShiftsRetrieved
} from '../assets/messages/assignedShiftMessages';


export const createAssignedShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { employeeId, shiftSlotId } = req.body as CreateAssignedShiftDTO;

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      res.status(404).json({ error: EmployeeNotFound });
      return;
    }

    const availableShift = await AvailableShift.findByPk(shiftSlotId);
    if (!availableShift) {
      res.status(404).json({ error: AvailableShiftNotFound });
      return;
    }

    const existingAssignedShift = await AssignedShift.findOne({
      where: { assigned_employee_id: employeeId, assigned_shift_id: shiftSlotId },
    });
    if (existingAssignedShift) {
      res.status(400).json({ error: AssignedShiftAlreadyExists });
      return;
    }

    const existingRequestedShift = await RequestedShift.findOne({
      where: { request_employee_id: employeeId, request_shift_id: shiftSlotId },
    });
    if (existingRequestedShift) {
      await existingRequestedShift.update({ request_status: RequestStatus.APPROVED as RequestStatus });
    }

    const assignedShift = await assignedShiftService.createAssignedShift(req.body as CreateAssignedShiftDTO);
    logger.info(CreatedAssignedShiftLog(assignedShift.assigned_id));
    res.status(201).json(apiResponse(assignedShift, AssignedShiftCreated));
  } catch (err) {
    logger.error(CreateAssignedShiftErrorLog(err));
    next(err);
  }
};


export const deleteAssignedShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(400).json({ error: InvalidAssignedShiftId });
      return; 
    }
    const success = await assignedShiftService.deleteAssignedShift(Number(req.params.id));
    if (!success) {
      res.status(404).json({ error: AssignedShiftNotFound });
      return; 
    }
    res.json(apiResponse(null, AssignedShiftDeleted));
  } catch (err) {
    next(err);
  }
};


export const getAssignedShiftById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(400).json({ error: InvalidShiftAssignId });
      return; 
    }

    const assignedShift = await assignedShiftService.getAssignedShiftById(shiftId);
    if (!assignedShift) {
      res.status(404).json({ error: AssignedShiftMissing });
      return; 
    }
    res.json(apiResponse(assignedShift));
  } catch (err) {
    logger.error(GetAssignedShiftsErrorLog(err)); 
    next(err);
  }
};


export const getAssignedShiftsByParams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    const requestedShifts = await assignedShiftService.getAssignedShiftsByParams(req.query as AssignedShiftQueryDTO);

    if (!requestedShifts || requestedShifts.length === 0) {
      res.status(404).json({ error: NoAssignedShiftsFound });
      return;
    }
    logger.info(FetchedAssignedShiftsLog);
    res.json(apiResponse(requestedShifts, AssignedShiftsRetrieved));
  } catch (err) {
    if (err instanceof Error && err.message.startsWith(InvalidEmployeeIdStart)) {
      res.status(400).json({ error: err.message });
      return;
    }
    logger.error(GetAssignedShiftsErrorLog(err));
    next(err);
  }
};