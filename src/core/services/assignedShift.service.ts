import { CreateAssignedShiftDTO, AssignedShiftQueryDTO } from '../../assets/types/types';
import { AssignedShift } from '../../config/postgres/models/assignedShift.model';
import { AvailableShift, Employee } from '../../config/postgres/models';

/**
 * Creates a new assigned shift in the database.
 * @param {CreateAssignedShiftDTO} data - Data for the new assigned shift.
 * @returns {Promise<AssignedShift>} The created assigned shift.
 */
export const createAssignedShift = async (data: CreateAssignedShiftDTO): Promise<AssignedShift> => {
  const shiftData: any = {
    assigned_shift_id_fkey: data.shiftSlotId,
    assigned_employee_id_fkey: data.employeeId,
  } ; // TODO: Create strict type for shiftData
 
  
  const newAssignedShift = await AssignedShift.create(shiftData);
  return newAssignedShift;
};

export const deleteAssignedShift = async (id: number): Promise<boolean> => {
  const assignedShift = await AssignedShift.findOne({ where: { assigned_id: id } });
  if (!assignedShift) return false;

  await assignedShift.destroy();
  return true;
};

export const getAssignedShiftById = async (id: number): Promise<AssignedShift | null> => {
  if (!Number.isInteger(id)) {
    throw new Error(`Invalid assigned shift ID: ${id}`);
  }
  const assignedShift = await AssignedShift.findOne({
    where: { assigned_id: id },
  });
  return assignedShift;
};

export const getAssignedShiftsByParams = async (params: AssignedShiftQueryDTO): Promise<AssignedShift[]> => {
  const shifts = await AssignedShift.findAll({
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
  return shifts;
};