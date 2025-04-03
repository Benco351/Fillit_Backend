import { Request, Response, NextFunction } from 'express';
import * as employeeService from '../services/employeeService';
import { CreateEmployeeDTO } from '../types/employeeSchema';
import { apiResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';

const validateEmployeeId = (id: string): number | null => {
  const empId = Number(id);
  return isNaN(empId) ? null : empId;
};

/**
 * Updates an employee's details by ID. Validates the ID and checks for email conflicts.
 * Responds with the updated employee or an error message.
 */
export const updateEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const empId = validateEmployeeId(req.params.id);
    if (empId === null) {
      res.status(400).json({ error: 'Invalid employee ID. Must be a number.' });
      return; 
    }

    const { id, email, ...updateData } = req.body as CreateEmployeeDTO;

    
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
 * Responds with the list of employees or an error message if none are found.
 */
export const getEmployees = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employees = await employeeService.getEmployeesByParams(_req.query);

    if (!employees || employees.length === 0) {
      res.status(404).json({ error: 'No employees found' });
      return; 
    }
    logger.info('Fetched employees');
    res.json(apiResponse(employees));
  } catch (err) {
    logger.error(`getEmployees error: ${err}`);
    next(err);
  }
};

/**
 * Fetches a single employee by ID. Validates the ID and responds with the employee or an error message.
 */
export const getEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const empId = validateEmployeeId(req.params.id);
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
 * Creates a new employee. Checks for email conflicts before creation.
 * Responds with the created employee or an error message.
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
    logger.info(`Created employee ${employee.id}`);
    res.status(201).json(apiResponse(employee, 'Employee created'));
  } catch (err) {
    logger.error(`createEmployee error: ${err}`);
    next(err);
  }
};

/**
 * Deletes an employee by ID. Validates the ID and responds with a success message or an error if not found.
 */
export const deleteEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    const empId = validateEmployeeId(req.params.id);
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