import { Request, Response, NextFunction } from 'express';
import * as shiftSwapRequestService from '../../../core/services/shiftSwapRequest.service';
import { apiResponse } from '../../../utils/apiResponse';
import { CreateShiftSwapRequestSchema, RespondShiftSwapRequestSchema, ShiftSwapRequestQuerySchema } from '../../../assets/types/types';

export const createShiftSwapRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
  const data = CreateShiftSwapRequestSchema.parse(req.body);
  const organization_id = req.body.organization_id || req.query.organization_id || req.params.organization_id;
  const result = await shiftSwapRequestService.createShiftSwapRequest(data, Number(organization_id));
    res.status(201).json(apiResponse(result, 'Shift swap request created'));
  } catch (err) {
    next(err);
  }
};

export const listShiftSwapRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ensure organization_id and employee_id are numbers
    const organization_id = req.query.organization_id ? Number(req.query.organization_id) : undefined;
    const employee_id = req.query.employee_id ? Number(req.query.employee_id) : undefined;
    if (!organization_id || isNaN(organization_id)) {
      res.status(400).json({ status: 'fail', errors: [{ code: 'invalid_type', expected: 'number', received: 'nan', path: ['organization_id'], message: 'Expected number, received nan' }] });
      return;
    }
    const rawQuery = {
      ...req.query,
      organization_id,
      employee_id,
    };
    const query = ShiftSwapRequestQuerySchema.parse(rawQuery);
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
  const organization_id = req.body.organization_id || req.query.organization_id || req.params.organization_id;
  const result = await shiftSwapRequestService.respondToShiftSwapRequest(id, data, Number(organization_id));
    res.json(apiResponse(result, 'Shift swap request updated'));
  } catch (err) {
    next(err);
  }
}; 