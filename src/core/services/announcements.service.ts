import { Announcement } from '../../config/postgres/models/announcements.model';
import { Employee } from '../../config/postgres/models/employee.model';
import { sequelize } from '../../config/postgres/db';
import { Transaction } from 'sequelize';


export interface CreateAnnouncementDTO {
  author_id: number;
  title?: string;
  body?: string;
  start_date?: Date;
  // end_date?: Date;
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
    
    const announcement = await Announcement.create(
      {
        ...data,
        title: data.title ?? '',
        body: data.body ?? '',
        start_date: finalStartDate, // Use the validated and parsed date.
      },
      { transaction }
    );
    await transaction.commit();
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
export const deleteAnnouncement = async (id: number): Promise<boolean> => {
  const transaction: Transaction = await sequelize.transaction();
  try {
    const announcement = await Announcement.findByPk(id, { transaction });
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
export const getAnnouncementById = async (id: number): Promise<Announcement | null> => {
  return Announcement.findOne({
    where: { announcement_id: id },
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
  data: Partial<CreateAnnouncementDTO>
): Promise<Announcement | null> => {
  const transaction: Transaction = await sequelize.transaction();
  try {
    const announcement = await Announcement.findByPk(id, { transaction });
    if (!announcement) {
      await transaction.rollback();
      return null;
    }

    await announcement.update(data, { transaction });
    await transaction.commit();
    return announcement;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
export function getAnnouncementsByParams(arg0: { title?: string | undefined; }) {
    throw new Error('Function not implemented.');
}