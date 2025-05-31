import { Request, Response, NextFunction } from 'express';
import * as assignedShiftService from '../../../core/services/assignedShift.service';
import { SwapAssignedShiftsDTO, CreateAssignedShiftDTO, AssignedShiftQueryDTO} from '../../../assets/types/types';
import { apiResponse } from '../../../utils/apiResponse';
import { logger } from '../../../config/logger';
import { AssignedShift, AvailableShift, Employee, RequestedShift } from '../../../config/postgres/models/index';
import { RequestStatus } from '../../../config/postgres/models/requestedShift.model';
import { validateId } from '../../../middlewares/validateMiddleware';
import {
  EmployeeNotFound,
  InvalidEmployeeIdStart
} from '../../../assets/messages/employeeMessages';
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
} from '../../../assets/messages/assignedShiftMessages';

/**
 * Creates a new assigned shift for an employee.
 *
 * @param {Request} req - The request object containing the employee ID and shift slot ID.
 * @param {Response} res - The response object to send the result.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 *
 * @example
 * POST /api/assigned-shifts
 * // Request body example:
 * {
 *   "employeeId": 12,
 *   "shiftSlotId": 2
 * }
 * // Response example:
 * {
 *   "status": "ok",
 *   "message": "Shift assign created",
 *   "data": {
 *       "assigned_id": 1,
 *       "assigned_shift_id": 2,
 *       "assigned_employee_id": 12
 *   }
 * }
 */
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
    if (availableShift.shift_slots_taken >= availableShift.shift_slots_amount) {
      res.status(400).json({ error: 'No available slots for this shift' });
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

/**
 * Deletes a specific assigned shift by ID.
 *
 * @param {number} id - ID of the assigned shift.
 * @returns {Promise<boolean>} True if the shift was deleted, false if not found.
 *
 * @example
 * DELETE /api/assigned-shifts/123
 *
 * // Response example:
 * {
 *   "status": "ok",
 *   "message": "Assigned shift deleted",
 *   "data": null
 * }
 */
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

/**
 * Retrieves a specific assigned shift by ID.
 *
 * @param {number} id - ID of the assigned shift.
 * @returns {Promise<AssignedShift | null>} The assigned shift or null if not found.
 *
 * @example
 * GET /api/assigned-shifts/123
 *
 * // Response example:
 * {
 *   "status": "ok",
 *   "message": "Success",
 *   "data": {
 *       "assigned_id": 2,
 *       "assigned_shift_id": 1,
 *       "assigned_employee_id": 1
 *   }
 * }
 */
export const getAssignedShiftById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shiftId = validateId(req.params.id);
    if (shiftId === null) {
      res.status(200).json(apiResponse([]));   // 200, empty array
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

/**
 * Retrieves assigned shifts based on query parameters.
 *
 * @param {ParsedQs} params - Query parameters for filtering shifts.
 * @returns {Promise<AssignedShift[]>} A list of assigned shifts.
 *
 * Available query parameters:
 * - assigned_employee_id: Filter by employee ID (optional).
 *
 * @example
 * GET /api/assigned-shifts
 *
 * // Response example:
 * {
 *   "status": "ok",
 *   "message": "Assigned shifts retrieved successfully",
 *   "data": [
 *       {
 *           "assigned_id": 1,
 *           "assigned_shift_id": 2,
 *           "assigned_employee_id": 1,
 *           "availableShift": {
 *               "shift_date": "2023-10-01",
 *               "shift_time_start": "10:00:00",
 *               "shift_time_end": "15:00:00"
 *           },
 *           "employee": {
 *               "employee_name": "rudiassss",
 *               "employee_email": "isssss@example.com"
 *           }
 *       }
 *   ]
 * }
 */
export const getAssignedShiftsByParams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // If admin, req.query will be empty (fetch all). If not, filter by params.
    const assignedShifts = await assignedShiftService.getAssignedShiftsByParams(req.query as AssignedShiftQueryDTO);

    res.status(200).json(apiResponse(assignedShifts, AssignedShiftsRetrieved));
    logger.info(FetchedAssignedShiftsLog);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith(InvalidEmployeeIdStart)) {
      res.status(400).json({ error: err.message });
      return;
    }
    logger.error(GetAssignedShiftsErrorLog(err));
    next(err);
  }
};
/**
 * Swaps two assigned shifts between employees.
 *
 * @param {Request} req - The request object containing the IDs of the two assigned shifts to be swapped.
 * @param {Response} res - The response object to send the result.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 *
 * @example
 * POST /api/assigned-shifts/swap
 * // Request body example:
 * {
 *   "assignedShiftId1": 1,
 *   "assignedShiftId2": 2
 * }
 * // Response example:
 * {
 *   "status": "ok",
 *   "message": "Assigned shifts swapped successfully",
 *   "data": [
 *     {
 *       "assigned_id": 1,
 *       "assigned_shift_id": 2,
 *       "assigned_employee_id": 3
 *     },
 *     {
 *       "assigned_id": 2,
 *       "assigned_shift_id": 1,
 *       "assigned_employee_id": 4
 *     }
 *   ]
 * }
 */
export const swapAssignedShifts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { assignedShiftId1, assignedShiftId2 } = req.body as SwapAssignedShiftsDTO;

    const assignedShift1 = await AssignedShift.findByPk(assignedShiftId1);
    const assignedShift2 = await AssignedShift.findByPk(assignedShiftId2);

    if (!assignedShift1) {
      res.status(404).json({ error: AssignedShiftNotFound });
      return;
    }
    if (!assignedShift2) {
      res.status(404).json({ error: AssignedShiftNotFound });
      return;
    }

    const swappedShifts = await assignedShiftService.swapAssignedShifts(assignedShiftId1, assignedShiftId2);
    logger.info("Swapped assigned shifts", { assignedShift1: swappedShifts[0], assignedShift2: swappedShifts[1] });
    res.status(200).json(apiResponse(swappedShifts, "Assigned shifts swapped successfully"));
  } catch (err) {
    logger.error(CreateAssignedShiftErrorLog(err));
    next(err);
  }
};
