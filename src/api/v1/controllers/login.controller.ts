import { Request, Response, NextFunction } from 'express';
import { loginEmployeeService } from '../../../core/services/login.service';
import { apiResponse } from '../../../utils/apiResponse';

export const loginEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const employee = await loginEmployeeService(email, password);
    if (!employee) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    res.json(apiResponse(employee));
  } catch (err) {
    next(err);
  }
}; 