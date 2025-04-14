import { Request, Response, NextFunction } from 'express';
import * as assignedShiftService from '../services/assignedShiftService';
import { CreateAssignedShiftDTO } from '../types/assignedShiftSchema';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';
import { AssignedShift, AvailableShift, Employee, RequestedShift } from '../config/postgres/models';
import { RequestStatus } from '../config/postgres/models/requestedShift.model';
import { validateId } from '../middlewares/validateMiddleware';

export const createAssignedShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { employeeId, shiftSlotId } = req.body as CreateAssignedShiftDTO;

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    const availableShift = await AvailableShift.findByPk(shiftSlotId);
    if (!availableShift) {
      res.status(404).json({ error: 'Available shift not found' });
      return;
    }

    const existingAssignedShift = await AssignedShift.findOne({
      where: { assigned_employee_id_fkey: employeeId, assigned_shift_id_fkey: shiftSlotId },
    });
    if (existingAssignedShift) {
      res.status(400).json({ error: 'Assigned shift already exists for this employee and shift slot' });
      return;
    }

    const existingRequestedShift = await RequestedShift.findOne({
      where: { request_employee_id: employeeId, request_shift_id: shiftSlotId },
    });
    if (existingRequestedShift) {
      await existingRequestedShift.update({ request_status: "approved" as RequestStatus });
    }

    const assignedShift = await assignedShiftService.createAssignedShift(req.body as CreateAssignedShiftDTO);
    logger.info(`Created shift assign ${assignedShift.assigned_id}`);
    res.status(201).json(apiResponse(assignedShift, 'Shift assign created'));
  } catch (err) {
    logger.error(`createAssignedShift: ${err}`);
    next(err);
  }
};


export const deleteAssignedShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(400).json({ error: 'Invalid assigned shift ID. Must be a number.' });
      return; 
    }
    const success = await assignedShiftService.deleteAssignedShift(Number(req.params.id));
    if (!success) {
      res.status(404).json({ error: 'Assigned shift not found' });
      return; 
    }
    res.json(apiResponse(null, 'Assigned shift deleted'));
  } catch (err) {
    next(err);
  }
};


export const getAssignedShiftById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(400).json({ error: 'Invalid Shift Assign ID. Must be a number.' });
      return; 
    }

    const assignedShift = await assignedShiftService.getAssignedShiftById(shiftId);
    if (!assignedShift) {
      res.status(404).json({ error: 'Assigned Shift not found' });
      return; 
    }
    res.json(apiResponse(assignedShift));
  } catch (err) {
    logger.error(`getRequestedShift error: ${err}`); 
    next(err);
  }
};


export const getAssignedShiftsByParams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const requestedShifts = await assignedShiftService.getAssignedShiftsByParams(req.query);

    if (!requestedShifts || requestedShifts.length === 0) {
      res.status(404).json({ error: 'No assigned shifts found' });
      return;
    }
    logger.info('Fetched assigned shifts');
    res.json(apiResponse(requestedShifts, 'Assigned shifts retrieved successfully'));
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Invalid employee ID:')) {
      res.status(400).json({ error: err.message });
      return;
    }
    logger.error(`getAssignedShifts error: ${err}`);
    next(err);
  }
};