import { Request, Response, NextFunction } from 'express';
import { Announcement, Employee } from '../../../config/postgres/models';
import * as announcementService from '../../../core/services/announcements.service';
import { apiResponse } from '../../../utils/apiResponse';
import { logger } from '../../../config/logger';
import { validateId } from '../../../middlewares/validateMiddleware';


const AnnouncementNotFound = "Announcement not found";
const EmployeeNotFound = "Employee (author) not found";
const AnnouncementCreated = "Announcement created successfully";
const AnnouncementDeleted = "Announcement deleted successfully";
const AnnouncementUpdated = "Announcement updated successfully";
const AnnouncementsRetrieved = "Announcements retrieved successfully";

/**
 * Creates a new announcement.
 */
export const createAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { author_id } = req.body;

    const author = await Employee.findByPk(author_id);
    if (!author) {
      res.status(404).json({ error: EmployeeNotFound });
      return;
    }

    const announcement = await announcementService.createAnnouncement(req.body);
    logger.info(`Created announcement ${announcement.announcement_id}`);
    res.status(201).json(apiResponse(announcement, AnnouncementCreated));
  } catch (err) {
    logger.error("Error creating announcement", err);
    next(err);
  }
};

/**
 * Deletes an announcement by ID.
 */
export const deleteAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const announcementId = validateId(req.params.id);
    if (announcementId === null) {
      res.status(400).json({ error: "Invalid announcement ID" });
      return;
    }

    const organization_id = Number((req.query as any).organization_id ?? (req.body as any).organization_id);
    const success = await announcementService.deleteAnnouncement(announcementId, organization_id);
    if (!success) {
      res.status(404).json({ error: AnnouncementNotFound });
      return;
    }

    res.json(apiResponse(null, AnnouncementDeleted));
  } catch (err) {
    logger.error("Error deleting announcement", err);
    next(err);
  }
};

/**
 * Retrieves an announcement by ID.
 */
export const getAnnouncementById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const announcementId = validateId(req.params.id);
    if (announcementId === null) {
      res.status(200).json(apiResponse([]));
      return;
    }

    const organization_id = Number((req.query as any).organization_id ?? (req.body as any).organization_id);
    const announcement = await announcementService.getAnnouncementById(announcementId, organization_id);
    if (!announcement) {
      res.status(404).json({ error: AnnouncementNotFound });
      return;
    }

    res.json(apiResponse(announcement));
  } catch (err) {
    logger.error("Error fetching announcement by id", err);
    next(err);
  }
};

/**
 * Retrieves all announcements (optionally with filters in query).
 */
export const getAnnouncements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const announcements = await announcementService.getAnnouncements(req.query);
    res.status(200).json(apiResponse(announcements, AnnouncementsRetrieved));
  } catch (err) {
    logger.error("Error fetching announcements", err);
    next(err);
  }
};

/**
 * Updates an announcement by ID.
 */
export const updateAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const announcementId = validateId(req.params.id);
    if (announcementId === null) {
      res.status(400).json({ error: "Invalid announcement ID" });
      return;
    }

    const organization_id = Number((req.query as any).organization_id ?? (req.body as any).organization_id);
    const updated = await announcementService.updateAnnouncement(announcementId, req.body, organization_id);
    if (!updated) {
      res.status(404).json({ error: AnnouncementNotFound });
      return;
    }

    res.json(apiResponse(updated, AnnouncementUpdated));
  } catch (err) {
    logger.error("Error updating announcement", err);
    next(err);
    }
};