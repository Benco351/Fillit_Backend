import { CreateAvailableShiftDTO} from '../types/availableShiftSchema';
import { AvailableShift } from '../config/postgres/models/availableShift.model'; 
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs'; // Import ParsedQs for query parameters
import { Op } from 'sequelize'; // Import Op for query operators

/**
 * Creates a new available shift in the database.
 * param data - Data for the new available shift.
 * returns The created available shift.
 */
export const createAvailableShift = async (data: CreateAvailableShiftDTO): Promise<AvailableShift> => {
  const newAvailableShift = await AvailableShift.create({
    shift_time_start: data.start,
    shift_time_end: data.end,
    shift_date: data.date
  } as any); 

  return newAvailableShift;
};

/**
 * Retrieves a specific available shift by ID.
 * param id - ID of the available shift.
 * returns The available shift or null if not found.
 */
export const getAvailableShiftById = async (id: number): Promise<AvailableShift| null> => {
  if (!Number.isInteger(id)) {
    throw new Error(`Invalid available shift ID: ${id}`);
  }
  const availableShift = await AvailableShift.findOne({
    where: { shift_id: id },
  });

  return availableShift;
};

/**
 * Retrieves available shifts based on query parameters.
 * param params - Query parameters for filtering shifts.
 * returns A list of available shifts.
 */
export const getAvailableShiftsByParams = async (params: ParsedQs): Promise<AvailableShift[]> => {
  const filters: any = {};

  const allowedParams = [
    'shift_date',
    'shift_start_before',
    'shift_start_after',
    'shift_end_before',
    'shift_end_after'
  ];

  for (const key in params) {
    if (!allowedParams.includes(key)) {
      throw new Error(`Unsupported parameter: ${key}`);
    }
  }

  if (params.shift_date) {
    filters.shift_date = params.shift_date.toString();
  }

  if (params.shift_start_before) {
    filters.shift_time_start = { ...filters.shift_time_start, [Op.lt]: params.shift_start_before.toString() };
  }

  if (params.shift_start_after) {
    filters.shift_time_start = { ...filters.shift_time_start, [Op.gt]: params.shift_start_after.toString() };
  }

  if (params.shift_end_before) {
    filters.shift_time_end = { ...filters.shift_time_end, [Op.lt]: params.shift_end_before.toString() };
  }

  if (params.shift_end_after) {
    filters.shift_time_end = { ...filters.shift_time_end, [Op.gt]: params.shift_end_after.toString() };
  }

  const availableShifts = await AvailableShift.findAll({
    where: filters
  });

  return availableShifts;
};

/**
 * Deletes a specific available shift by ID.
 * param id - ID of the available shift.
 * returns True if the shift was deleted, false if not found.
 */
export const deleteAvailableShift = async (id: number): Promise<boolean> => {
  const availableShift = await AvailableShift.findOne({ where: { shift_id: id } });
  if (!availableShift) return false;

  await availableShift.destroy();
  return true;
};

/**
 * Updates a specific available shift by ID.
 * param id - ID of the available shift.
 * param data - Partial data to update the shift.
 * returns The updated available shift or null if not found.
 */
export const updateAvailableShift = async (id: number, data: Partial<CreateAvailableShiftDTO>): Promise<AvailableShift | null> => {
  const availableShift = await AvailableShift.findOne({ where: { shift_id: id } });
  if (!availableShift) return null;

  const mappedData: any = {};
  if (data.date) mappedData.shift_date = data.date;
  if (data.start) mappedData.shift_time_start = data.start;
  if (data.end) mappedData.shift_time_end = data.end;

  // Update the shift with the mapped data
  await availableShift.update(mappedData);
  return availableShift;
};