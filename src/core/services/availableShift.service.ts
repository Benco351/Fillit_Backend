import { CreateAvailableShiftDTO, AvailableShiftQueryDTO } from '../../assets/types/types';
import { AvailableShift } from '../../config/postgres/models/availableShift.model';
import { Op } from 'sequelize';

export const createAvailableShift = async (data: CreateAvailableShiftDTO): Promise<AvailableShift> => {
  const shiftData: any = {
    shift_date: data.date,
    shift_time_start: data.start,
    shift_time_end: data.end,
    shift_slots_amount: data.shift_slots_amount,
    shift_slots_taken: 0
  }; // TODO: Create strict type for shiftData

  const newAvailableShift = await AvailableShift.create(shiftData);
  return newAvailableShift;
};

export const getAvailableShiftById = async (id: number): Promise<AvailableShift | null> => {
  if (!Number.isInteger(id)) {
    throw new Error(`Invalid available shift ID: ${id}`);
  }
  const availableShift = await AvailableShift.findOne({
    where: { shift_id: id },
  });
  return availableShift;
};

export const getAvailableShiftsByParams = async (params: AvailableShiftQueryDTO): Promise<AvailableShift[]> => {
  const filters: Record<string, unknown> = {};

  if (params.shift_date) filters.shift_date = params.shift_date.toString();
  if (params.shift_start_before) filters.shift_time_start = { [Op.lt]: params.shift_start_before };
  if (params.shift_start_after) filters.shift_time_start = { [Op.gt]: params.shift_start_after };
  if (params.shift_end_before) filters.shift_time_end = { [Op.lt]: params.shift_end_before };
  if (params.shift_end_after) filters.shift_time_end = { [Op.gt]: params.shift_end_after };
  if (params.shift_slots_amount) filters.shift_slots_amount = params.shift_slots_amount;
  if (params.shift_slots_taken) filters.shift_slots_taken = params.shift_slots_taken;

  // Handle date range filtering using shift_date
  if (params.shift_start_date && params.shift_end_date) {
    filters.shift_date = {
      [Op.between]: [params.shift_start_date.toString(), params.shift_end_date.toString()],
    };
  } else if (params.shift_start_date) {
    filters.shift_date = { [Op.gte]: params.shift_start_date.toString() };
  } else if (params.shift_end_date) {
    filters.shift_date = { [Op.lte]: params.shift_end_date.toString() };
  }

  // // Add filter: do not return shifts where shift_slots_taken == shift_slots_amount
  // filters.shift_slots_taken = { 
  //   ...(filters.shift_slots_taken || {}),
  //   [Op.lt]: filters.shift_slots_amount ?? { [Op.col]: 'shift_slots_amount' }
  // };

  const availableShifts = await AvailableShift.findAll({ where: filters });
  return availableShifts;
};
export const deleteAvailableShift = async (id: number): Promise<boolean> => {
  const availableShift = await AvailableShift.findOne({ where: { shift_id: id } });
  if (!availableShift) return false;

  await availableShift.destroy();
  return true;
};

export const updateAvailableShift = async (id: number, data: Partial<CreateAvailableShiftDTO>): Promise<AvailableShift | null> => {
  const availableShift = await AvailableShift.findOne({ where: { shift_id: id } });
  if (!availableShift) return null;

  const mappedData: Partial<AvailableShift> = {
    ...(data.date && { shift_date: data.date }),
    ...(data.start && { shift_time_start: data.start }),
    ...(data.end && { shift_time_end: data.end }),
    ...(data.shift_slots_amount && { shift_slots_amount: data.shift_slots_amount }),
  };

  await availableShift.update(mappedData);
  return availableShift;
};