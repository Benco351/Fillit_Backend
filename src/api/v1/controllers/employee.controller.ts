import { Request, Response, NextFunction } from 'express';
import * as employeeService from '../../../core/services/employee.service';
import { UpdateEmployeeDTO, EmployeeQueryDTO } from '../../../assets/types/types';
import { apiResponse } from '../../../utils/apiResponse';
import { logger } from '../../../config/logger';
import { validateId } from '../../../middlewares/validateMiddleware';
import {
  InvalidEmployeeId,
  EmailAlreadyTaken,
  EmployeeNotFound,
  EmployeeUpdated,
  NoEmployeesFound,
  EmployeeDeleted,
  UpdateEmployeeLog,
  GetEmployeesErrorLog,
  GetEmployeeErrorLog,
  FetchedEmployees,
  InvalidAdminFilterValue
} from '../../../assets/messages/employeeMessages';
import { z } from 'zod';
import AWS from 'aws-sdk';
import { createCognitoClient } from './auth.controller'; // Add this import

//body:
//{ 
// "admin": true 
//}
export const assignAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const empId = validateId(req.params.id);
    if (empId === null) {
      res.status(400).json({ error: InvalidEmployeeId });
      return; 
    }

    // Get employee
    const employee = await employeeService.getEmployeeById(empId);
    if (!employee) {
      res.status(404).json({ error: EmployeeNotFound });
      return;
    }

    // Check current admin status
    const currentAdmin = employee.employee_admin;
    const requestedAdmin = req.body.admin;

    if (currentAdmin === requestedAdmin) {
      res.status(400).json({ error: `Employee is already ${requestedAdmin ? 'an admin' : 'not an admin'}.` });
      return;
    }

    // Update admin status in DB
    const updatedEmployee = await employeeService.updateEmployeeAdminStatus(empId, requestedAdmin);

    // Cognito group management
    try {
      const cognito = await createCognitoClient();

      // Find the user by email (username in Cognito is usually the email)
      const listUsersResp = await cognito
        .listUsers({
          UserPoolId: `${process.env.COGNITO_USER_POOL_ID}`,
          Filter: `email = "${employee.employee_email}"`
        })
        .promise();

      const user = listUsersResp.Users && listUsersResp.Users[0];
      if (!user) {
        res.status(404).json({ error: 'User not found in Cognito' });
        return;
      }

      if (requestedAdmin) {
        // Add to admin group
        await cognito
          .adminAddUserToGroup({
            UserPoolId: `${process.env.COGNITO_USER_POOL_ID}`,
            Username: user.Username!,
            GroupName: 'Admins'
          })
          .promise();
      } else {
        // Remove from admin group
        await cognito
          .adminRemoveUserFromGroup({
            UserPoolId: `${process.env.COGNITO_USER_POOL_ID}`,
            Username: user.Username!,
            GroupName: 'Admins'
          })
          .promise();
      }
    } catch (cognitoError: any) {
      console.error('Error updating Cognito admin group:', cognitoError);
      res.status(500).json({ error: 'Failed to update Cognito admin group', details: cognitoError.message });
      return;
    }

    res.json(apiResponse(updatedEmployee, `Employee admin status updated to ${requestedAdmin}`));
  } catch (err) {
    logger.error(GetEmployeeErrorLog(err)); 
    next(err);
  }
};



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
 * Checks if an employee exists by email.
 *
 * @param {Request} req - The request object containing the employee email in params.
 * @param {Response} res - The response object to send the result.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 *
 * @example
 * GET /api/employees/verify/john.doe@example.com
 *
 * Response (if exists):
 * {
 *   "message": "The employee with this email already exists",
 *   "employee_id": 1
 * }
 *
 * Response (if not exists):
 * {
 *   "message": "There is no employee with this email"
 * }
 *
 * Response (invalid email):
 * {
 *   "error": "Invalid email format"
 * }
 */
export const isEmployeeExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const emailSchema = z.string().email();
    const email = emailSchema.parse(req.params.email);

    const employee = await employeeService.getEmployeeByEmail(email);
    if (employee) {
      res.status(200).json({ message: "The employee with this email already exists", employee_id: employee.employee_id });
      return; 
    } else {
      res.status(404).json({ message: "There is no employee with this email" });
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