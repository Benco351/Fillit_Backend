import { Request, Response, NextFunction } from 'express';
import * as availableShiftService from '../../../core/services/availableShift.service';
import { CreateAvailableShiftDTO, UpdateAvailableShiftDTO, AvailableShiftQueryDTO  } from '../../../assets/types/types';
import { apiResponse } from '../../../utils/apiResponse';
import { logger } from '../../../config/logger';
import { validateId } from '../../../middlewares/validateMiddleware';
import {
  InvalidAvailableShiftId,
  AvailableShiftNotFound,
  UnsupportedParamPrefix,
  CreatedAvailableShiftLog,
  FetchedAvailableShiftsLog,
  GetAvailableShiftErrorLog,
  GetAvailableShiftsErrorLog,
  UpdateAvailableShiftErrorLog,
  AvailableShiftCreated,
  AvailableShiftDeleted,
  AvailableShiftUpdated,
  CreateAvailableShiftErrorLog
} from '../../../assets/messages/availableShiftMessages';

/**
 * Creates a new available shift in the system.
 *
 * @async
 * @param {Request} req - Express request object containing shift data in the body.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} Resolves when the shift is created.
 *
 * @example
 * // Request body example:
 * {
 *   "date": "2024-04-19",
 *   "start": "09:00:00",
 *   "end": "17:00:00",
 *   "shift_slots_amount": 5,
 *   "department_id": 2 // (optional) Department to which this shift belongs
 * }
 * // Response example:
 * {
 *   "status": "ok",
 *   "message": "Available shift created",
 *   "data": {
 *       "shift_id": 4,
 *       "shift_date": "2024-04-19",
 *       "shift_time_start": "09:00:00",
 *       "shift_time_end": "17:00:00",
 *       "shift_slots_amount": 5,  
 *       "shift_slots_taken": 0,
 *       "department_id": 2
 *   }
 * }
 *
 * // Error example if department does not exist:
 * // Status: 400
 * // Body: { "error": "Department with id 999 does not exist" }
 */
export const createAvailableShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const availableShift = await availableShiftService.createAvailableShift(req.body as CreateAvailableShiftDTO);
    logger.info(CreatedAvailableShiftLog(availableShift.shift_id));
    res.status(201).json(apiResponse(availableShift, AvailableShiftCreated));
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Department with id')) {
      res.status(400).json({ error: err.message });
      return;
    }
    logger.error(CreateAvailableShiftErrorLog(err));
    next(err);
  }
};

/**
 * Retrieves a specific available shift by its ID.
 *
 * @async
 * @param {Request} req - Express request object containing shift ID in params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Resolves with the found shift or error response
 * @throws {Error} When retrieval fails
 *
 * @example
 * GET /api/available-shifts/123
 * {
 *   "status": "ok",
 *   "message": "Success",
 *   "data": {
 *       "shift_id": 4,
 *       "shift_date": "2023-04-19",
 *       "shift_time_start": "09:00:00",
 *       "shift_time_end": "13:00:00"
 *   }
 * }
 */
export const getAvailableShiftById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(200).json(apiResponse([]));   // 200, empty array
      return; 
    }

    const availableShift = await availableShiftService.getAvailableShiftById(shiftId);
    if (!availableShift) {
      res.status(404).json({ error: AvailableShiftNotFound });
      return; 
    }
    // Only include the nested department object (with id, name, address), remove department_name
    const shiftWithDept = (() => {
      const shift = availableShift.toJSON();
      if (shift.department) {
        return {
          ...shift,
          department: {
            department_id: shift.department.department_id,
            department_name: shift.department.department_name,
            department_address: shift.department.department_address,
          },
        };
      } else {
        return {
          ...shift,
          department: null,
        };
      }
    })();
    if ('department_name' in shiftWithDept) delete shiftWithDept.department_name;
    res.json(apiResponse(shiftWithDept));
  } catch (err) {
    logger.error(GetAvailableShiftErrorLog(err)); 
    next(err);
  }
};

/**
 * Retrieves all available shifts based on provided query parameters.
 *
 * @async
 * @param {Request} _req - Express request object containing query parameters.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} Resolves with an array of shifts or an error response.
 *
 * Available query parameters:
 * - `shift_date` (optional): Date of the shift (format: YYYY-MM-DD).
 * - `shift_start_after` (optional): Start time of the shift (format: HH:mm:ss).
 * - `shift_end_before` (optional): End time of the shift (format: HH:mm:ss).
 * - `shift_start_before` (optional): Start time of the shift (format: HH:mm:ss).
 * - `shift_end_after` (optional): End time of the shift (format: HH:mm:ss).
 * - `shift_start_date` (optional): Start date of the shift (format: YYYY-MM-DD).
 * - `shift_end_date` (optional): End date of the shift (format: YYYY-MM-DD).
 * - `shift_slots_amount` (optional): Number of slots available for the shift.
 * - `shift_slots_taken` (optional): Number of slots already taken for the shift.
 * - `department` (optional): Department id to filter shifts by department.
 *
 * @example
 * // Query parameters example:
 * GET /api/available-shifts?shift_date=2024-04-19&department=2
 *
 * // Error example if department does not exist:
 * // Status: 400
 * // Body: { "error": "Department with id 999 does not exist" }
 */
export const getAvailableShiftsByParams = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const availableShifts = await availableShiftService.getAvailableShiftsByParams(_req.query as AvailableShiftQueryDTO);

    if (!availableShifts || availableShifts.length === 0) {
      res.status(200).json(apiResponse([]));   // 200, empty array
      return; 
    }
    logger.info(FetchedAvailableShiftsLog);
    // Only include the nested department object (with id, name, address), remove department_name
    const shiftsWithDept = availableShifts.map(shift => {
      const s = shift.toJSON();
      if (s.department) {
        return {
          ...s,
          department: {
            department_id: s.department.department_id,
            department_name: s.department.department_name,
            department_address: s.department.department_address,
          },
        };
      } else {
        return {
          ...s,
          department: null,
        };
      }
    });
    shiftsWithDept.forEach(s => { if ('department_name' in s) delete s.department_name; });
    res.json(apiResponse(shiftsWithDept));
  } catch (err) {
    if (err instanceof Error && err.message.startsWith(UnsupportedParamPrefix)) {
        res.status(400).json({ error: err.message });
        return;
      }
    if (err instanceof Error && err.message.startsWith('Department with id')) {
      res.status(400).json({ error: err.message });
      return;
    }
    logger.error(GetAvailableShiftsErrorLog(err));
    next(err);
  }
};

/**
 * Deletes a specific available shift by its ID.
 *
 * @async
 * @param {Request} req - Express request object containing shift ID in params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Resolves when the shift is deleted
 * @throws {Error} When deletion fails
 *
 * @example
 * DELETE /api/available-shifts/123
 *
 * // Response example:
 * {
 *   "status": "ok",
 *   "message": "Available shift deleted",
 *   "data": null
 * }
 */
export const deleteAvailableShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(400).json({ error: InvalidAvailableShiftId });
      return; 
    }
    const success = await availableShiftService.deleteAvailableShift(Number(req.params.id));
    if (!success) {
      res.status(404).json({ error: AvailableShiftNotFound });
      return; 
    }
    res.json(apiResponse(null, AvailableShiftDeleted));
  } catch (err) {
    next(err);
  }
};

/**
 * Updates a specific available shift by its ID.
 *
 * @async
 * @param {Request} req - Express request object containing shift ID in params and update data in body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Resolves with the updated shift
 * @throws {Error} When update fails
 *
 * @example
 * // Request body example:
 * PUT /api/available-shifts/123
 * {
 *   "date": "2023-10-01",
 *   "start": "10:00:00",
 *   "end": "18:00:00",
 *   "department_id": 3 // (optional) Department to which this shift belongs
 * }
 *
 * // Response example:
 * {
 *   "status": "ok",
 *   "message": "Available shift updated",
 *   "data": {
 *       "shift_id": 2,
 *       "shift_date": "2023-10-01",
 *       "shift_time_start": "10:00:00",
 *       "shift_time_end": "15:00:00",
 *       "department_id": 3
 *   }
 * }
 *
 * // Error example if department does not exist:
 * // Status: 400
 * // Body: { "error": "Department with id 999 does not exist" }
 */
export const updateAvailableShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(400).json({ error: InvalidAvailableShiftId });
      return; 
    }

    const availableShifts = await availableShiftService.updateAvailableShift(shiftId, req.body as UpdateAvailableShiftDTO);
    if (!availableShifts) {
      res.status(404).json({ error: AvailableShiftNotFound });
      return; 
    }
    res.json(apiResponse(availableShifts, AvailableShiftUpdated));
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Department with id')) {
      res.status(400).json({ error: err.message });
      return;
    }
    logger.error(UpdateAvailableShiftErrorLog(err));
    next(err);
  }
};