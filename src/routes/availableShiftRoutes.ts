import { Router } from 'express';
import * as availableShiftController from '../controllers/availableShiftController';
import { validate } from '../middlewares/validateMiddleware';
import { CreateAvailableShiftSchema, UpdateAvailableShiftSchema } from '../types/availableShiftSchema';

// Router for handling available shift operations.
const router = Router();

// GET /:id - Retrieves a specific available shift by ID.
router.get('/:id', availableShiftController.getAvailableShift);

// GET / - Retrieves all available shifts based on query parameters.
router.get('/', availableShiftController.getAvailableShifts);

// POST / - Creates a new available shift. Validates the request body using CreateAvailableShiftSchema.
router.post('/', validate(CreateAvailableShiftSchema), availableShiftController.createAvailableShift);

// DELETE /:id - Deletes a specific available shift by ID.
router.delete('/:id', availableShiftController.deleteAvailableShift);

// PUT /:id - Updates a specific available shift by ID. Validates the request body using UpdateAvailableShiftSchema.
router.put('/:id', validate(UpdateAvailableShiftSchema), availableShiftController.updateAvailableShift);

export default router;