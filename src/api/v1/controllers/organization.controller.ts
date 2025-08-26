import { Request, Response, NextFunction } from 'express';
import * as organizationService from '../../../core/services/organization.service';
import { apiResponse } from '../../../utils/apiResponse';
import { logger } from '../../../config/logger';
import { CreateOrganizationDTO } from '../../../assets/types/types';

export const createOrganization = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orgData: CreateOrganizationDTO = req.body;
    const organization = await organizationService.createOrganization(orgData);
    res.status(201).json(apiResponse(organization, 'Organization created'));
  } catch (err) {
    logger.error('Error creating organization:', err);
    next(err);
  }
};

export const getOrganizations = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const organizations = await organizationService.getOrganizations();
    res.json(apiResponse(organizations, 'Organizations fetched'));
  } catch (err) {
    logger.error('Error fetching organizations:', err);
    next(err);
  }
};
