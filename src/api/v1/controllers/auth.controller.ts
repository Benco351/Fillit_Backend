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
import AWS from 'aws-sdk';

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

export const addToGroup = async (req: Request, res: Response) => {
  const { email, group } = req.body;
  if (!email || !group) {
    return res.status(400).json({ message: 'Missing email or group' });
  }

  try {
    const cognito = await createCognitoClient();

    // Find the user by email (username in Cognito is usually the email)
    const listUsersResp = await cognito
      .listUsers({
        UserPoolId: `${process.env.COGNITO_USER_POOL_ID}`,
        Filter: `email = "${email}"`
      })
      .promise();

    const user = listUsersResp.Users && listUsersResp.Users[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found in Cognito' });
    }

    await cognito
      .adminAddUserToGroup({
        UserPoolId: `${process.env.COGNITO_USER_POOL_ID}`,
        Username: user.Username!,
        GroupName: group,
      })
      .promise();

    res.status(200).json({ message: `User ${email} added to group ${group}` });
  } catch (error: any) {
    console.error('Error adding user to group:', error);
    res.status(500).json({ message: 'Failed to add user to group', error: error.message });
  }
};

export const createCognitoClient = async (): Promise<AWS.CognitoIdentityServiceProvider> => {
  try {
    // Fetch credentials from SSM Parameter Store
    const ssm = new AWS.SSM({ region: process.env.COGNITO_REGION });

    // Get access key ID
    const accessKeyIdParam = await ssm
      .getParameter({
        Name: process.env.AWS_ACCESS_KEY_ID_SSM!,
        WithDecryption: true,
      })
      .promise();

    // Get secret access key
    const secretAccessKeyParam = await ssm
      .getParameter({
        Name: process.env.AWS_SECRET_ACCESS_KEY_SSM!,
        WithDecryption: true,
      })
      .promise();

    const accessKeyId = accessKeyIdParam.Parameter?.Value;
    const secretAccessKey = secretAccessKeyParam.Parameter?.Value;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('Failed to retrieve AWS credentials from SSM');
    }

    // Create Cognito client with credentials from SSM
    const cognito = new AWS.CognitoIdentityServiceProvider({
      region: process.env.COGNITO_REGION,
      accessKeyId,
      secretAccessKey,
    });

    return cognito;
  } catch (error) {
    console.error('Error creating Cognito client with SSM credentials:', error);
    throw new Error('Failed to create Cognito client using SSM credentials');
  }
};