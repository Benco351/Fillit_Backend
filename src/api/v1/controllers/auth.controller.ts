import { Request, Response, NextFunction } from 'express';
import * as employeeService from '../../../core/services/employee.service';
import { CreateEmployeeDTO } from '../../../assets/types/types';
import { apiResponse } from '../../../utils/apiResponse';
import { logger } from '../../../config/logger';
import {
  CreatedEmployeeLog,
  EmployeeCreated,
  EmailExists,
  CreateEmployeeErrorLog,
} from '../../../assets/messages/employeeMessages';

/**
 * Creates a new employee.
 * 
 * @param {Request} req - The request object containing the employee data.
 * @param {Response} res - The response object to send the result.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * 
 * @example
 * POST /auth/sign-up
 * 
 * Request body:
 * {
 *   "name": "David Weiss",
 *   "email": "david@gmail.com",
 *   "password": "123456789",
 *   "phone": "987654321"
 * }
 * 
 * Response:
 * {
 *   "status": "ok",
 *   "message": "Employee created",
 *   "data": {
 *     "employee_id": 2
 *   }
 * }
 */
export const createEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body as CreateEmployeeDTO;

    const existingEmployee = await employeeService.getEmployeeByEmail(email);
    if (existingEmployee) {
      res.status(400).json({ error: EmailExists });
      return; 
    }

    const employee = await employeeService.createEmployee(req.body as CreateEmployeeDTO);
    logger.info(CreatedEmployeeLog(employee.employee_id));
    res.status(201).json(apiResponse({"employee_id":employee.employee_id }, EmployeeCreated));    
    
  } catch (err) {
    logger.error(CreateEmployeeErrorLog(err));
    next(err);
  }
};
