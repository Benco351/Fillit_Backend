import { CreateOrganizationDTO } from '../../assets/types/types';
import { Organization } from '../../config/postgres/models/organization.model';

/**
 * Creates a new organization in the database.
 * @param {CreateOrganizationDTO} data - Organization data to create.
 * @returns {Promise<Organization>} The created organization.
 */
export const createOrganization = async (data: CreateOrganizationDTO): Promise<Organization> => {
  const newOrganization = await Organization.create({
    organization_name: data.name,
  } as any);

  return newOrganization;
};

/**
 * Fetches all organizations' names and IDs.
 * @returns {Promise<{ organization_id: number; organization_name: string }[]>} List of organizations with their IDs and names.
 */
export const getOrganizations = async (): Promise<{ organization_id: number; organization_name: string }[]> => {
  const organizations = await Organization.findAll({
    attributes: ['organization_id', 'organization_name'],
    order: [['organization_name', 'ASC']],
  });
  return organizations.map(org => ({
    organization_id: org.organization_id,
    organization_name: org.organization_name,
  }));
};
