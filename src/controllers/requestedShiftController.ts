import { Request, Response, NextFunction } from 'express';
import * as requestedShiftService from '../services/requestedShiftService';
import { CreateRequestedShiftDTO, UpdateRequestedShiftDTO } from '../types/requestedShiftSchema';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';
import { validateId } from '../middlewares/validateMiddleware';
import { Employee } from '../config/postgres/models/employee.model';
import { AvailableShift } from '../config/postgres/models/availableShift.model';
import { RequestedShift } from '../config/postgres/models/requestedShift.model';



export const createShiftRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { employeeId, shiftSlotId } = req.body as CreateRequestedShiftDTO;

    // Check if the employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    // Check if the available shift exists
    const availableShift = await AvailableShift.findByPk(shiftSlotId);
    if (!availableShift) {
      res.status(404).json({ error: 'Available shift not found' });
      return;
    }

    // Check if there is already a requested shift with the same employee and shift slot
    const existingRequestedShift = await RequestedShift.findOne({
      where: { request_employee_id: employeeId, request_shift_id: shiftSlotId },
    });
    if (existingRequestedShift) {
      res.status(400).json({ error: 'Requested shift already exists for this employee and shift slot' });
      return;
    }

    // Create the requested shift
    const requestedShift = await requestedShiftService.createRequestedShift(req.body as CreateRequestedShiftDTO);
    logger.info(`Created shift request ${requestedShift.id}`);
    res.status(201).json(apiResponse(requestedShift, 'Shift request created'));
  } catch (err) {
    logger.error(`createRequestedShift: ${err}`);
    next(err);
  }
};


export const getRequestedShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(400).json({ error: 'Invalid Shift Request ID. Must be a number.' });
      return; 
    }

    const requestedShift = await requestedShiftService.getRequestedShiftById(shiftId);
    if (!requestedShift) {
      res.status(404).json({ error: 'Shift Request not found' });
      return; 
    }
    res.json(apiResponse(requestedShift));
  } catch (err) {
    logger.error(`getRequestedShift error: ${err}`); 
    next(err);
  }
};

export const getRequestedShifts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const requestedShifts = await requestedShiftService.getRequestedShiftsByParams(req.query);

    if (!requestedShifts || requestedShifts.length === 0) {
      res.status(404).json({ error: 'No requested shifts found' });
      return;
    }
    logger.info('Fetched requested shifts');
    res.json(apiResponse(requestedShifts, 'Requested shifts retrieved successfully'));
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Invalid employee ID:')) {
      res.status(400).json({ error: err.message });
      return;
    }
    logger.error(`getRequestedShifts error: ${err}`);
    next(err);
  }
};

export const deleteRequestedShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(400).json({ error: 'Invalid requested shift ID. Must be a number.' });
      return;
    }

    const success = await requestedShiftService.deleteRequestedShift(shiftId);
    if (!success) {
      res.status(404).json({ error: 'Requested shift not found' });
      return;
    }

    res.json(apiResponse(null, 'Requested shift deleted'));
  } catch (err) {
    next(err);
  }
};

export const updateRequestedShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  
  try {
    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(400).json({ error: 'Invalid requested shift ID. Must be a number.' });
      return; 
    }
     
   const requestedShifts = await requestedShiftService.updateRequestedShift(shiftId, req.body as UpdateRequestedShiftDTO);
    if (!requestedShifts) {
      res.status(404).json({ error: 'Requested shift not found' });
      return; 
    }
    res.json(apiResponse(requestedShifts, 'Requested shift updated'));

  
  } catch (err) {
    logger.error(`updateRequestedShift error: ${err}`); 
    next(err);
  }
};


