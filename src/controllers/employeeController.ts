import { Request, Response, NextFunction } from 'express';
import * as employeeService from '../services/employeeService';
import { CreateEmployeeDTO, UpdateEmployeeDTO, EmployeeQueryDTO } from '../types/employeeSchema';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';
import { validateId } from '../middlewares/validateMiddleware';
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
} from '../assets/messages/employeeMessages';


/**
 * Updates an employee's details by ID.
 * 
 * @param {Request} req - The request object containing the employee ID and update data.
 * @param {Response} res - The response object to send the result.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
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
    res.status(201).json(apiResponse({"employee id":employee.employee_id }, EmployeeCreated));

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