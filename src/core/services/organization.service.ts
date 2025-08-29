import { createEmployee } from './employee.service';
import { sendEmail } from '../../utils/email';
import { Organization } from '../../config/postgres/models/organization.model';
import { Employee } from '../../config/postgres/models/employee.model';
/**
 * Creates a new organization and its admin employee, sends a welcome email to the admin.
 * @param orgData - Organization data (name)
 * @param adminData - Admin employee data (name, email, phone, password, admin flag)
 * @returns Promise resolving to the created organization and admin employee
 */
export const createOrganizationWithAdmin = async (
  orgData: { name: string },
  adminData: { name: string; email: string; phone?: string; password: string; admin?: boolean }
): Promise<{ organization: Organization; admin: Employee }> => {
  // Create organization
  const newOrganization = await Organization.create({
    organization_name: orgData.name,
  } as any);

  // Create admin employee and associate with organization
  const newAdmin = await createEmployee({
    name: adminData.name,
    email: adminData.email,
    phone: adminData.phone,
    password: adminData.password,
    organization_id: newOrganization.organization_id,
    admin: true,
  });

  /**
   * Sends a welcome email to the newly created organization admin.
   * @param email - Admin's email address
   * @param subject - Email subject
   * @param htmlBody - HTML content of the email
   */
  // Send email to admin
  if (newAdmin && newAdmin.employee_email) {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif;">
        <img src="https://fillitshifits.com/logo.png" alt="Fillit Logo" style="height:40px;margin-bottom:16px;" />
        <h2>Welcome to Fillit!</h2>
        <p>Hello ${newAdmin.employee_name},</p>
        <p>Your organization has been successfully created.</p>
        <p><b>Organization ID:</b> ${newOrganization.organization_id}</p>
        <p>You can now manage your organization and invite employees using Fillit.</p>
        <hr />
        <small>This is an automated message from Fillit.</small>
      </div>
    `;
    await sendEmail(
      newAdmin.employee_email,
      'Organization Created',
      htmlBody
    );
  }

  return { organization: newOrganization, admin: newAdmin };
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
