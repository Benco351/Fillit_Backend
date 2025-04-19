import { CreateRequestedShiftDTO, UpdateRequestedShiftDTO, RequestedShiftQueryDTO} from '../../assets/types/types';
import { RequestedShift } from '../../config/postgres/models/requestedShift.model'; 
import { AvailableShift, Employee } from '../../config/postgres/models';
import { RequestStatus } from '../../config/postgres/models/requestedShift.model';

/**
 * Creates a new requested shift.
 * @param {CreateRequestedShiftDTO} data - Data for the requested shift.
 * @returns {Promise<RequestedShift>} The created requested shift.
 */
export const createRequestedShift = async (data: CreateRequestedShiftDTO): Promise<RequestedShift> => {
  const newRequestedShift = await RequestedShift.create({
    request_shift_id: data.shiftSlotId,
    request_employee_id: data.employeeId,
    ...(data.notes && { request_notes: data.notes })
  } as any); 

  return newRequestedShift;
};

/**
 * Retrieves a requested shift by its ID.
 * @param {number} id - The ID of the requested shift.
 * @returns {Promise<RequestedShift | null>} The requested shift or null if not found.
 */
export const getRequestedShiftById = async (id: number): Promise<RequestedShift| null> => {
  if (!Number.isInteger(id)) {
    throw new Error(`Invalid available shift ID: ${id}`);
  }
  const requestedShift = await RequestedShift.findOne({
    where: { request_id: id },
  });

  return requestedShift;
};

/**
 * Retrieves requested shifts based on query parameters.
 * @param {ParsedQs} params - Query parameters for filtering requested shifts.
 * @returns {Promise<RequestedShift[]>} A list of requested shifts matching the filters.
 */
export const getRequestedShiftsByParams = async (params: RequestedShiftQueryDTO): Promise<RequestedShift[]> => {
  const requestedShifts = await RequestedShift.findAll({
    where: params,
    include: [
      {
        model: AvailableShift,
        attributes: ['shift_date', 'shift_time_start', 'shift_time_end'],
      },
      {
        model: Employee,
        attributes: ['employee_name', 'employee_email'],
      },
    ],
  });

  return requestedShifts;
};

/**
 * Deletes a requested shift by its ID.
 * @param {number} id - The ID of the requested shift to delete.
 * @returns {Promise<boolean>} True if the shift was deleted, false otherwise.
 */
export const deleteRequestedShift = async (id: number): Promise<boolean> => {
  const deletedCount = await RequestedShift.destroy({
    where: { request_id: id },
  });

  return deletedCount > 0;
};

/**
 * Updates a requested shift by its ID.
 * @param {number} id - The ID of the requested shift to update.
 * @param {UpdateRequestedShiftDTO} data - Data to update the requested shift.
 * @returns {Promise<RequestedShift | null>} The updated requested shift or null if not found.
 */
export const updateRequestedShift = async (id: number, data: UpdateRequestedShiftDTO): Promise<RequestedShift | null> => {
  const requestedShift = await RequestedShift.findOne({ where: { request_id: id } });
  if (!requestedShift) return null;

  if (data.status) {
    await requestedShift.update({ request_status: data.status as RequestStatus });
  }
  if (data.notes) {
    await requestedShift.update({ request_notes: data.notes });
  }

  return requestedShift;
};