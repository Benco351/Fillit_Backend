import { Request, Response, NextFunction } from 'express';
import { loginEmployeeService } from '../../../core/services/login.service';
import { apiResponse } from '../../../utils/apiResponse';

export const loginEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, organization_id } = req.body;
    const parsedOrganizationId =
      organization_id !== undefined && organization_id !== null && organization_id !== ''
        ? Number(organization_id)
        : undefined;
    // Ensure organization_id is parsed and normalized on the request body for future use
    (req.body as any).organization_id = parsedOrganizationId;
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