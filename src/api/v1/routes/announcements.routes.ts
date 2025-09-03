import { Router } from 'express';
import { validate, validateQuery } from '../../../middlewares/validateMiddleware';
import { CreateAnnouncementSchema, UpdateAnnouncementSchema, AnnouncementQuerySchema } from '../../../assets/types/types';
import { getAnnouncements, getAnnouncementById, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../controllers/announcements.controller';

const router = Router();

router.get('/', validateQuery(AnnouncementQuerySchema), getAnnouncements);
router.get('/:id', validateQuery(AnnouncementQuerySchema), getAnnouncementById);
router.post('/', validate(CreateAnnouncementSchema), createAnnouncement);
router.put('/:id', validate(UpdateAnnouncementSchema), updateAnnouncement);
router.delete('/:id', deleteAnnouncement);

export default router;