import { Request, Response, NextFunction } from 'express';
import * as availableShiftService from '../../../core/services/availableShift.service';
import { CreateAvailableShiftDTO, UpdateAvailableShiftDTO, AvailableShiftQueryDTO  } from '../../../assets/types/types';
import { apiResponse } from '../../../utils/apiResponse';
import { logger } from '../../../config/logger';
import { validateId } from '../../../middlewares/validateMiddleware';
import {
  InvalidAvailableShiftId,
  AvailableShiftNotFound,
  NoAvailableShiftsFound,
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
 * @param {Request} req - Express request object containing shift data in the body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Resolves when the shift is created
 * @throws {Error} When shift creation fails
 * 
 * @example
 * // Request body example:
 * {
 *   "date": "2024-04-19",
 *   "start": "09:00:00",
 *   "end": "17:00:00"
 * }
 */
export const createAvailableShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const availableShift = await  availableShiftService.createAvailableShift(req.body as CreateAvailableShiftDTO); 
    logger.info(CreatedAvailableShiftLog(availableShift.shift_id));
    res.status(201).json(apiResponse(availableShift, AvailableShiftCreated));
  } catch (err) {
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
 */
export const getAvailableShiftById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(400).json({ error: InvalidAvailableShiftId });
      return; 
    }

    const availableShift = await availableShiftService.getAvailableShiftById(shiftId);
    if (!availableShift) {
      res.status(404).json({ error: AvailableShiftNotFound });
      return; 
    }
    res.json(apiResponse(availableShift));
  } catch (err) {
    logger.error(GetAvailableShiftErrorLog(err)); 
    next(err);
  }
};

/**
 * Retrieves all available shifts based on provided query parameters.
 * 
 * @async
 * @param {Request} _req - Express request object containing query parameters
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Resolves with array of shifts or error response
 * @throws {Error} When retrieval fails or query parameters are invalid
 * 
 * @example
 * // Query parameters example:
 * GET /api/available-shifts?shift_date=2024-04-19&shift_start_after=09:00:00
 */
export const getAvailableShiftsByParams = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const availableShifts = await availableShiftService.getAvailableShiftsByParams(_req.query as AvailableShiftQueryDTO);

    if (!availableShifts || availableShifts.length === 0) {
      res.status(404).json({ error: NoAvailableShiftsFound });
      return; 
    }
    logger.info(FetchedAvailableShiftsLog);
    res.json(apiResponse(availableShifts));
  } catch (err) {
    if (err instanceof Error && err.message.startsWith(UnsupportedParamPrefix)) {
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
 * PATCH /api/available-shifts/123
 * {
 *   "start": "10:00:00",
 *   "end": "18:00:00"
 * }
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
    logger.error(UpdateAvailableShiftErrorLog(err));
    next(err);
  }
};