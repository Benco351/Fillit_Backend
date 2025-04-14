import { Request, Response, NextFunction } from 'express';
import * as availableShiftService from '../services/availableShiftService';
import { CreateAvailableShiftDTO, UpdateAvailableShiftDTO, AvailableShiftQueryDTO  } from '../types/availableShiftSchema';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';
import { validateId } from '../middlewares/validateMiddleware';

/**
 * Creates a new available shift.
 * param req - Express request object containing shift data in the body.
 * param res - Express response object.
 * param next - Express next middleware function.
 */
export const createAvailableShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const availableShift = await  availableShiftService.createAvailableShift(req.body as CreateAvailableShiftDTO); 
    logger.info(`Created available shift ${availableShift.shift_id}`);
    res.status(201).json(apiResponse(availableShift, 'Available shift created'));
  } catch (err) {
    logger.error(`createAvailableShift: ${err}`);
    next(err);
  }
};

/**
 * Retrieves a specific available shift by ID.
 * param req - Express request object containing shift ID in params.
 * param res - Express response object.
 * param next - Express next middleware function.
 */
export const getAvailableShiftById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(400).json({ error: 'Invalid Available Shift ID. Must be a number.' });
      return; 
    }

    const availableShift = await availableShiftService.getAvailableShiftById(shiftId);
    if (!availableShift) {
      res.status(404).json({ error: 'Available Shift not found' });
      return; 
    }
    res.json(apiResponse(availableShift));
  } catch (err) {
    logger.error(`getAvailableShift error: ${err}`); 
    next(err);
  }
};

/**
 * Retrieves all available shifts based on query parameters.
 * param _req - Express request object containing query parameters.
 * param res - Express response object.
 * param next - Express next middleware function.
 */
export const getAvailableShiftsByParams = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const availableShifts = await availableShiftService.getAvailableShiftsByParams(_req.query as AvailableShiftQueryDTO);

    if (!availableShifts || availableShifts.length === 0) {
      res.status(404).json({ error: 'No available shiftss found' });
      return; 
    }
    logger.info('Fetched available shifts');
    res.json(apiResponse(availableShifts));
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Unsupported parameter:')) {
        res.status(400).json({ error: err.message });
        return;
      }
    logger.error(`getAvailableShifts: ${err}`);
    next(err);
  }
};

/**
 * Deletes a specific available shift by ID.
 * param req - Express request object containing shift ID in params.
 * param res - Express response object.
 * param next - Express next middleware function.
 */
export const deleteAvailableShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(400).json({ error: 'Invalid available shift ID. Must be a number.' });
      return; 
    }
    const success = await availableShiftService.deleteAvailableShift(Number(req.params.id));
    if (!success) {
      res.status(404).json({ error: 'Available shift not found' });
      return; 
    }
    res.json(apiResponse(null, 'Available shift deleted'));
  } catch (err) {
    next(err);
  }
};

/**
 * Updates a specific available shift by ID.
 * param req - Express request object containing shift ID in params and update data in the body.
 * param res - Express response object.
 * param next - Express next middleware function.
 */
export const updateAvailableShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(400).json({ error: 'Invalid available shift ID. Must be a number.' });
      return; 
    }

    const availableShifts = await availableShiftService.updateAvailableShift(shiftId, req.body as UpdateAvailableShiftDTO);
    if (!availableShifts) {
      res.status(404).json({ error: 'Available shift not found' });
      return; 
    }
    res.json(apiResponse(availableShifts, 'Available shift updated'));
  } catch (err) {
    logger.error(`updateAvailableShift error: ${err}`);
    next(err);
  }
};