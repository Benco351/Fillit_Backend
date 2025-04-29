import { Request, Response, NextFunction } from 'express';
import * as employeeService from '../../../core/services/employee.service';
import { CreateEmployeeDTO, UpdateEmployeeDTO, EmployeeQueryDTO } from '../../../assets/types/types';
import { apiResponse } from '../../../utils/apiResponse';
import { logger } from '../../../config/logger';
import { validateId } from '../../../middlewares/validateMiddleware';
import {
  InvalidEmployeeId,
  EmailAlreadyTaken,
  EmployeeNotFound,
  EmployeeUpdated,
  NoEmployeesFound,
  CreatedEmployeeLog,
  EmployeeCreated,
  EmployeeDeleted,
  EmailExists,
  UpdateEmployeeLog,
  GetEmployeesErrorLog,
  GetEmployeeErrorLog,
  CreateEmployeeErrorLog,
  FetchedEmployees,
  InvalidAdminFilterValue
} from '../../../assets/messages/employeeMessages';
import { z } from 'zod';

/**
 * Updates an employee's details by ID.
 * 
 * @param {Request} req - The request object containing the employee ID and update data.
 * @param {Response} res - The response object to send the result.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * 
 * @example
 * PUT /api/employees/1
 * 
 * Request body:
 * {
 *   "name": "Alice Johnson",
 *   "email": "alice@example.com",
 *   "password": "securePassword123",
 *   "admin": false,
 *   "phone": "+1234567890"
 * }
 * 
 * Response:
 * {
 *   "status": "ok",
 *   "message": "Employee updated",
 *   "data": {
 *     "employee_id": 1,
 *     "employee_name": "Alice Johnson",
 *     "employee_email": "alice@example.com",
 *     "employee_phone": "+1234567890",
 *     "employee_admin": false
 *   }
 * }
 */
export const updateEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const empId = validateId(req.params.id);
    if (empId === null) {
      res.status(400).json({ error: InvalidEmployeeId });
      return; 
    }

    const { email, ...updateData } = req.body as UpdateEmployeeDTO;

    
    if (email) {
      console.log(email);
      const existingEmployee = await employeeService.getEmployeeByEmail(email.trim()); 
      if (existingEmployee && existingEmployee.employee_id !== empId) {
        res.status(400).json({ error: EmailAlreadyTaken });
        return; 
      }
    }

    const employee = await employeeService.updateEmployee(empId, { email, ...updateData });
    if (!employee) {
      res.status(404).json({ error: EmployeeNotFound });
      return; 
    }
    res.json(apiResponse(employee, EmployeeUpdated));
  } catch (err) {
    logger.error(UpdateEmployeeLog(err));
    next(err);
  }
};

/**
 * Retrieves a list of employees based on query parameters.
 * 
 * @param {Request} _req - The request object containing query parameters.
 * @param {Response} res - The response object to send the result.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * 
 * Available query parameters:
 * - `employee_admin` (optional): Filter employees by admin status (`true`/`false`).
 * 
 * @example
 * GET /api/employees?employee_admin=true
 * 
 * Response:
 * {
 *   "status": "ok",
 *   "message": "Success",
 *   "data": [
 *     {
 *       "employee_id": 1,
 *       "employee_name": "Alice Johnson",
 *       "employee_email": "alice@example.com",
 *       "employee_phone": "+1234567890",
 *       "employee_admin": true
 *     },
 *     {
 *       "employee_id": 2,
 *       "employee_name": "David Weiss",
 *       "employee_email": "david@gmail.com",
 *       "employee_phone": "987654321",
 *       "employee_admin": false
 *     }
 *   ]
 * }
 */
export const getEmployeesByParams = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employees = await employeeService.getEmployeesByParams(_req.query as EmployeeQueryDTO);

    if (!employees || employees.length === 0) {
      res.status(404).json({ error: NoEmployeesFound });
      return; 
    }
    logger.info(FetchedEmployees);
    res.json(apiResponse(employees));
  } catch (err) {
    if (err instanceof Error && err.message.startsWith(InvalidAdminFilterValue)) {
      res.status(400).json({ error: err.message });
      return;
    }
    logger.error(GetEmployeesErrorLog(err));
    next(err);
  }
};

/**
 * Fetches a single employee by ID.
 * 
 * @param {Request} req - The request object containing the employee ID.
 * @param {Response} res - The response object to send the result.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * 
 * @example
 * GET /api/employees/1
 * 
 * Response:
 * {
 *   "status": "ok",
 *   "message": "Success",
 *   "data": {
 *     "employee_id": 2,
 *     "employee_name": "David Weiss",
 *     "employee_email": "david@gmail.com",
 *     "employee_phone": "987654321",
 *     "employee_admin": false
 *   }
 * }
 */
export const getEmployeeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const empId = validateId(req.params.id);
    if (empId === null) {
      res.status(400).json({ error: InvalidEmployeeId });
      return; 
    }

    const employee = await employeeService.getEmployeeById(empId);
    if (!employee) {
      res.status(404).json({ error: EmployeeNotFound });
      return; 
    }
    res.json(apiResponse(employee));
  } catch (err) {
    logger.error(GetEmployeeErrorLog(err)); 
    next(err);
  }
};

/**
 * Creates a new employee.
 * 
 * @param {Request} req - The request object containing the employee data.
 * @param {Response} res - The response object to send the result.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * 
 * @example
 * POST /api/employees
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

    // SIGNUP THE EMPLOYEE IN COGNITO
    
  } catch (err) {
    logger.error(CreateEmployeeErrorLog(err));
    next(err);
  }
};

/**
 * Deletes an employee by ID.
 * 
 * @param {Request} req - The request object containing the employee ID.
 * @param {Response} res - The response object to send the result.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * 
 * @example
 * DELETE /api/employees/1
 * 
 * Response:
 * {
 *   "status": "ok",
 *   "message": "Employee deleted",
 *   "data": null
 * }
 */
export const deleteEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    const empId = validateId(req.params.id);
    if (empId === null) {
      res.status(400).json({ error: InvalidEmployeeId });
      return; 
    }
    const success = await employeeService.deleteEmployee(Number(req.params.id));
    if (!success) {
      res.status(404).json({ error: EmployeeNotFound });
      return; 
    }
    res.json(apiResponse(null, EmployeeDeleted));
  } catch (err) {
    next(err);
  }
};

/**
 * Checks if an employee exists by their email.
 * 
 * @param {Request} req - The request object containing the email in the parameters.
 * @param {Response} res - The response object to send the result.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * 
 * @example
 * GET /api/employees/verify/davidA@gmail.com
 * 
 * Response:
 * Code: 404
 * {
 *   "message": "The employee with this email already exists"
 * }
 * 
 * Or:
 * Code: 200
 * {
 *   "message": "False"
 * }
 */
export const isEmployeeExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const emailSchema = z.string().email();
    const email = emailSchema.parse(req.params.email);

    const exists = await employeeService.isEmployeeExistsByEmail(email);
    if (exists) {
      res.status(409).json({ message: "The employee with this email already exists" });
      return; 
    } else {
      res.status(200).json({ message: "False" });
      return; 
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }
    next(err);
  }
};