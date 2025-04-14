import { Request, Response, NextFunction } from 'express';
import * as employeeService from '../services/employeeService';
import { CreateEmployeeDTO, UpdateEmployeeDTO, EmployeeQueryDTO } from '../types/employeeSchema';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';
import { validateId } from '../middlewares/validateMiddleware';

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
      res.status(400).json({ error: 'Invalid employee ID. Must be a number.' });
      return; 
    }

    const { email, ...updateData } = req.body as UpdateEmployeeDTO;

    
    if (email) {
      console.log(email);
      const existingEmployee = await employeeService.getEmployeeByEmail(email.trim()); 
      if (existingEmployee && existingEmployee.employee_id !== empId) {
        res.status(400).json({ error: 'This email is already taken by another employee.' });
        return; 
      }
    }

    const employee = await employeeService.updateEmployee(empId, { email, ...updateData });
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return; 
    }
    res.json(apiResponse(employee, 'Employee updated'));
  } catch (err) {
    logger.error(`updateEmployee error: ${err}`);
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
      res.status(404).json({ error: 'No employees found' });
      return; 
    }
    logger.info('Fetched employees');
    res.json(apiResponse(employees));
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Invalid admin filter value')) {
      res.status(400).json({ error: err.message });
      return;
    }
    logger.error(`getEmployees error: ${err}`);
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
      res.status(400).json({ error: 'Invalid employee ID. Must be a number.' });
      return; 
    }

    const employee = await employeeService.getEmployeeById(empId);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return; 
    }
    res.json(apiResponse(employee));
  } catch (err) {
    logger.error(`getEmployee error: ${err}`); 
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
      res.status(400).json({ error: 'An employee with this email already exists.' });
      return; 
    }

    const employee = await employeeService.createEmployee(req.body as CreateEmployeeDTO);
    logger.info(`Created employee ${employee.employee_id}`);
    res.status(201).json(apiResponse({"employee id":employee.employee_id }, 'Employee created'));
  } catch (err) {
    logger.error(`createEmployee error: ${err}`);
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
      res.status(400).json({ error: 'Invalid employee ID. Must be a number.' });
      return; 
    }
    const success = await employeeService.deleteEmployee(Number(req.params.id));
    if (!success) {
      res.status(404).json({ error: 'Employee not found' });
      return; 
    }
    res.json(apiResponse(null, 'Employee deleted'));
  } catch (err) {
    next(err);
  }
};