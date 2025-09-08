import { Announcement } from '../../config/postgres/models/announcements.model';
import { Employee } from '../../config/postgres/models/employee.model';
import { sequelize } from '../../config/postgres/db';
import { Transaction } from 'sequelize';
import { sendEmail } from '../../utils/email';
import { getEmployeesByParams } from './employee.service';


export interface CreateAnnouncementDTO {
  author_id: number;
  title?: string;
  // Accept both content (API contract) and body (DB column) for flexibility
  content?: string;
  body?: string;
  start_date?: Date;
  // end_date?: Date;
  organization_id: number;
}

/**
 * Creates a new announcement in the database.
 * @param {CreateAnnouncementDTO} data - Data for the new announcement.
 * @returns {Promise<Announcement>} The created announcement.
 */
export const createAnnouncement = async (data: CreateAnnouncementDTO): Promise<Announcement> => {
  const transaction: Transaction = await sequelize.transaction();
  try {
    let finalStartDate: Date | null = null;

    // If start_date is provided, try to parse it into a valid Date object.
    if (data.start_date) {
      const parsedDate = new Date(data.start_date);
      // Check if the parsed date is valid.
      if (!isNaN(parsedDate.getTime())) {
        finalStartDate = parsedDate;
      }
    }
    
    const bodyToSave = (data as any).content ?? data.body ?? '';

    const announcement = await Announcement.create(
      {
        ...data,
        title: data.title ?? '',
        body: bodyToSave,
        start_date: finalStartDate, // Use the validated and parsed date.
      },
      { transaction }
    );
    await transaction.commit();

    // Send email notifications to all employees in the organization
    try {
      // Get the author's information
      const author = await Employee.findOne({
        where: { employee_id: data.author_id, organization_id: data.organization_id },
        attributes: ['employee_name', 'employee_email']
      });

      // Get all employees in the organization
      const employees = await getEmployeesByParams({ organization_id: data.organization_id });

      // Send email to each employee
      for (const employee of employees) {
        if (employee.employee_email && author && author.employee_name) {
          const htmlBody = `
            <div style="font-family: Arial, sans-serif;">
              <img src="https://fillitshifits.com/fillit.png" alt="Fillit Logo" style="height:40px;margin-bottom:16px;" />
              <h2>New Announcement</h2>
              <p>Hello ${employee.employee_name},</p>
              <p>You have received a new announcement from <b>${author.employee_name}</b>.</p>
              <p><b>Title:</b> ${data.title || 'No title'}</p>
              <p><b>Content:</b></p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                ${bodyToSave || 'No content'}
              </div>
              <p>Please log in to Fillit to view more details.</p>
              <hr />
              <small>This is an automated message from Fillit.</small>
            </div>
          `;
          await sendEmail(
            employee.employee_email,
            `New Announcement: ${data.title || 'No title'}`,
            htmlBody
          );
        }
      }
    } catch (emailError) {
      // Log email error but don't fail the announcement creation
      console.error('Error sending announcement emails:', emailError);
    }

    return announcement;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Deletes an announcement by ID.
 * @param {number} id - ID of the announcement.
 * @returns {Promise<boolean>} True if deleted, false otherwise.
 */
export const deleteAnnouncement = async (id: number, organization_id: number): Promise<boolean> => {
  const transaction: Transaction = await sequelize.transaction();
  try {
    const announcement = await Announcement.findOne({ where: { announcement_id: id, organization_id }, transaction });
    if (!announcement) {
      await transaction.rollback();
      return false;
    }

    await announcement.destroy({ transaction });
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Retrieves an announcement by ID.
 * @param {number} id - ID of the announcement.
 * @returns {Promise<Announcement | null>} The announcement or null.
 */
export const getAnnouncementById = async (id: number, organization_id: number): Promise<Announcement | null> => {
  return Announcement.findOne({
    where: { announcement_id: id, organization_id },
    include: [
      {
        model: Employee,
        attributes: ['employee_id', 'employee_name', 'employee_email'],
      },
    ],
  });
};

/**
 * Retrieves all announcements (optionally with filters).
 * @param {any} params - Filter parameters.
 * @returns {Promise<Announcement[]>} List of announcements.
 */
export const getAnnouncements = async (params: any = {}): Promise<Announcement[]> => {
  return Announcement.findAll({
    where: params,
    include: [
      {
        model: Employee,
        attributes: ['employee_id', 'employee_name', 'employee_email'],
      },
    ],
    order: [['announcement_id', 'DESC']], // latest first
  });
};

/**
 * Updates an announcement by ID.
 * @param {number} id - ID of the announcement.
 * @param {Partial<CreateAnnouncementDTO>} data - Fields to update.
 * @returns {Promise<Announcement | null>} Updated announcement or null.
 */
export const updateAnnouncement = async (
  id: number,
  data: Partial<CreateAnnouncementDTO>,
  organization_id: number
): Promise<Announcement | null> => {
  const transaction: Transaction = await sequelize.transaction();
  try {
    const announcement = await Announcement.findOne({ where: { announcement_id: id, organization_id }, transaction });
    if (!announcement) {
      await transaction.rollback();
      return null;
    }

    // Map content -> body if provided
    const updatePayload: any = { ...data };
    if ((data as any).content !== undefined) {
      updatePayload.body = (data as any).content;
      delete updatePayload.content;
    }

    await announcement.update(updatePayload, { transaction });
    await transaction.commit();
    return announcement;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
export function getAnnouncementsByParams() {
    throw new Error('Function not implemented.');
}