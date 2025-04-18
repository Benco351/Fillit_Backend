import { Request, Response, NextFunction } from 'express';
import * as requestedShiftService from '../services/requestedShiftService';
import { CreateRequestedShiftDTO, UpdateRequestedShiftDTO, RequestedShiftQueryDTO } from '../types/requestedShiftSchema';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';
import { validateId } from '../middlewares/validateMiddleware';
import { Employee } from '../config/postgres/models/employee.model';
import { AvailableShift } from '../config/postgres/models/availableShift.model';
import { RequestedShift } from '../config/postgres/models/requestedShift.model';
import { EmployeeNotFound, InvalidEmployeeIdStart } from '../assets/messages/employeeMessages';
import { AvailableShiftNotFound } from '../assets/messages/availableShiftMessages';
import {
  RequestedShiftExists,
  ShiftRequestCreated,
  ShiftRequestNotFound,
  InvalidShiftRequestId,
  NoRequestedShiftsFound,
  RequestedShiftsRetrieved,
  InvalidRequestedShiftId,
  RequestedShiftDeleted,
  RequestedShiftUpdated,
  CreatedRequestedShiftLog,
  CreateRequestedShiftErrorLog,
  GetRequestedShiftErrorLog,
  UpdateRequestedShiftErrorLog,
  FetchedRequestedShiftsLog
} from '../assets/messages/requestedShiftMessages';


/**
 * Creates a new shift request.
 * @param {Request} req - The request object containing employeeId and shiftSlotId.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 */
export const createShiftRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { employeeId, shiftSlotId } = req.body as CreateRequestedShiftDTO;

    // Check if the employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      res.status(404).json({ error: EmployeeNotFound });
      return;
    }

    // Check if the available shift exists
    const availableShift = await AvailableShift.findByPk(shiftSlotId);
    if (!availableShift) {
      res.status(404).json({ error: AvailableShiftNotFound });
      return;
    }

    // Check if there is already a requested shift with the same employee and shift slot
    const existingRequestedShift = await RequestedShift.findOne({
      where: { request_employee_id: employeeId, request_shift_id: shiftSlotId },
    });
    if (existingRequestedShift) {
      res.status(400).json({ error: RequestedShiftExists });
      return;
    }

    // Create the requested shift
    const requestedShift = await requestedShiftService.createRequestedShift(req.body as CreateRequestedShiftDTO);
    logger.info(CreatedRequestedShiftLog(requestedShift.request_id));
    res.status(201).json(apiResponse(requestedShift, ShiftRequestCreated));
  } catch (err) {
    logger.error(CreateRequestedShiftErrorLog(err));
    next(err);
  }
};

/**
 * Retrieves a specific requested shift by ID.
 * @param {Request} req - The request object containing the shift ID in params.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 */
export const getRequestedShiftById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(400).json({ error: InvalidShiftRequestId });
      return; 
    }

    const requestedShift = await requestedShiftService.getRequestedShiftById(shiftId);
    if (!requestedShift) {
      res.status(404).json({ error: ShiftRequestNotFound });
      return; 
    }
    res.json(apiResponse(requestedShift));
  } catch (err) {
    logger.error(GetRequestedShiftErrorLog(err)); 
    next(err);
  }
};

/**
 * Retrieves requested shifts based on query parameters.
 * @param {Request} req - The request object containing query parameters.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 */
export const getRequestedShiftsByParams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const requestedShifts = await requestedShiftService.getRequestedShiftsByParams(req.query as RequestedShiftQueryDTO);

    if (!requestedShifts || requestedShifts.length === 0) {
      res.status(404).json({ error: NoRequestedShiftsFound });
      return;
    }
    logger.info(FetchedRequestedShiftsLog);
    res.json(apiResponse(requestedShifts, RequestedShiftsRetrieved));
  } catch (err) {
    if (err instanceof Error && err.message.startsWith(InvalidEmployeeIdStart)) {
      res.status(400).json({ error: err.message });
      return;
    }
    logger.error(GetRequestedShiftErrorLog(err));
    next(err);
  }
};

/**
 * Deletes a specific requested shift by ID.
 * @param {Request} req - The request object containing the shift ID in params.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 */
export const deleteRequestedShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(400).json({ error: InvalidRequestedShiftId });
      return;
    }

    const success = await requestedShiftService.deleteRequestedShift(shiftId);
    if (!success) {
      res.status(404).json({ error: ShiftRequestNotFound});
      return;
    }

    res.json(apiResponse(null, RequestedShiftDeleted));
  } catch (err) {
    next(err);
  }
};

/**
 * Updates a specific requested shift by ID.
 * @param {Request} req - The request object containing the shift ID in params and update data in the body.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 */
export const updateRequestedShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  
  try {
    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(400).json({ error: InvalidRequestedShiftId });
      return; 
    }
     
   const requestedShifts = await requestedShiftService.updateRequestedShift(shiftId, req.body as UpdateRequestedShiftDTO);
    if (!requestedShifts) {
      res.status(404).json({ error: ShiftRequestNotFound });
      return; 
    }
    res.json(apiResponse(requestedShifts, RequestedShiftUpdated));
  
  } catch (err) {
    logger.error(UpdateRequestedShiftErrorLog(err)); 
    next(err);
  }
};


