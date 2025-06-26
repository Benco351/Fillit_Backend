import { Request, Response, NextFunction } from 'express';
import * as shiftSwapRequestService from '../../../core/services/shiftSwapRequest.service';
import { apiResponse } from '../../../utils/apiResponse';
import { CreateShiftSwapRequestSchema, RespondShiftSwapRequestSchema, ShiftSwapRequestQuerySchema } from '../../../assets/types/types';

export const createShiftSwapRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CreateShiftSwapRequestSchema.parse(req.body);
    const result = await shiftSwapRequestService.createShiftSwapRequest(data);
    res.status(201).json(apiResponse(result, 'Shift swap request created'));
  } catch (err) {
    next(err);
  }
};

export const listShiftSwapRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = ShiftSwapRequestQuerySchema.parse(req.query);
    const result = await shiftSwapRequestService.listShiftSwapRequests(query);
    res.json(apiResponse(result, 'Shift swap requests retrieved'));
  } catch (err) {
    next(err);
  }
};

export const respondToShiftSwapRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = RespondShiftSwapRequestSchema.parse(req.body);
    const result = await shiftSwapRequestService.respondToShiftSwapRequest(id, data);
    res.json(apiResponse(result, 'Shift swap request updated'));
  } catch (err) {
    next(err);
  }
}; 