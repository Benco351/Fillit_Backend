import { Request, Response, NextFunction } from 'express';
import * as requestedShiftService from '../../../core/services/requestedShift.service';
import { CreateRequestedShiftDTO, UpdateRequestedShiftDTO, RequestedShiftQueryDTO } from '../../../assets/types/types';
import { apiResponse } from '../../../utils/apiResponse';
import { logger } from '../../../config/logger';
import { validateId } from '../../../middlewares/validateMiddleware';
import { Employee } from '../../../config/postgres/models/employee.model';
import { AvailableShift } from '../../../config/postgres/models/availableShift.model';
import { RequestedShift } from '../../../config/postgres/models/requestedShift.model';
import { EmployeeNotFound, InvalidEmployeeIdStart } from '../../../assets/messages/employeeMessages';
import { AvailableShiftNotFound } from '../../../assets/messages/availableShiftMessages';
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
} from '../../../assets/messages/requestedShiftMessages';


/**
 * Creates a new shift request.
 * 
 * @param {Request} req - The request object containing employeeId, shiftSlotId, and optional notes.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 * 
 * @example
 * POST /api/requested-shifts
 * 
 * Request body:
 * {
 *   "employeeId": 1,
 *   "shiftSlotId": 1,
 *   "notes": "I would like to request this shift."
 * }
 * 
 * Response:
 * {
 *   "status": "ok",
 *   "message": "Shift request created",
 *   "data": {
 *     "request_notes": "I would like to request this shift.",
 *     "request_status": "pending",
 *     "request_id": 2,
 *     "request_shift_id": 1,
 *     "request_employee_id": 1
 *   }
 * }
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
 * 
 * @param {Request} req - The request object containing the shift ID in params.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 * 
 * @example
 * GET /api/requested-shifts/123
 * 
 * Response:
 * {
 *   "status": "ok",
 *   "message": "Success",
 *   "data": {
 *     "request_id": 2,
 *     "request_shift_id": 2,
 *     "request_employee_id": 1,
 *     "request_notes": null,
 *     "request_status": "pending"
 *   }
 * }
 */
export const getRequestedShiftById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(200).json(apiResponse([]));   // 200, empty array
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
 * 
 * @param {Request} req - The request object containing query parameters.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 * 
 * Available query parameters:
 * - `request_employee_id` (optional): Filter requested shifts by employee ID.
 * - `request_status` (optional): Filter requested shifts by request status (`pending`, `approved`, `denied`).
 * 
 * @example
 * GET /api/requested-shifts?request_employee_id=1&request_status=pending
 * 
 * Response:
 * {
 *   "status": "ok",
 *   "message": "Requested shifts retrieved successfully",
 *   "data": [
 *     {
 *       "request_id": 2,
 *       "request_shift_id": 2,
 *       "request_employee_id": 1,
 *       "request_notes": null,
 *       "request_status": "pending",
 *       "availableShift": {
 *         "shift_date": "2023-10-01",
 *         "shift_time_start": "10:00:00",
 *         "shift_time_end": "15:00:00"
 *       },
 *       "employee": {
 *         "employee_name": "rudiassss",
 *         "employee_email": "isssss@example.com"
 *       }
 *     },
 *     {
 *       "request_id": 3,
 *       "request_shift_id": 1,
 *       "request_employee_id": 1,
 *       "request_notes": "I want this",
 *       "request_status": "pending",
 *       "availableShift": {
 *         "shift_date": "2023-10-02",
 *         "shift_time_start": "09:00:00",
 *         "shift_time_end": "13:00:00"
 *       },
 *       "employee": {
 *         "employee_name": "rudiassss",
 *         "employee_email": "isssss@example.com"
 *       }
 *     }
 *   ]
 * }
 */
export const getRequestedShiftsByParams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const requestedShifts = await requestedShiftService.getRequestedShiftsByParams(req.query as RequestedShiftQueryDTO);

    if (!requestedShifts || requestedShifts.length === 0) {
      res.status(200).json(apiResponse([]));   // 200, empty array
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
 * 
 * @param {Request} req - The request object containing the shift ID in params.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 * 
 * @example
 * DELETE /api/requested-shifts/123
 * 
 * Response:
 * {
 *   "status": "ok",
 *   "message": "Requested shift deleted",
 *   "data": null
 * }
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
 * 
 * @param {Request} req - The request object containing the shift ID in params and update data in the body.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 * 
 * Request body:
 * - `status` (optional): The new status of the shift (`pending`, `approved`, `denied`).
 * - `notes` (optional): Additional notes for the shift request.
 * 
 * @example
 * PUT /api/requested-shifts/123
 * 
 * Request body:
 * {
 *   "status": "denied",
 *   "notes": "I cannot work this shift."
 * }
 * 
 * Response:
 * {
 *   "status": "ok",
 *   "message": "Requested shift updated",
 *   "data": {
 *     "request_id": 2,
 *     "request_shift_id": 2,
 *     "request_employee_id": 1,
 *     "request_notes": "I cannot work this shift.",
 *     "request_status": "denied"
 *   }
 * }
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


