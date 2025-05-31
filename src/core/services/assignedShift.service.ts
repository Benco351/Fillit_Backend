import { CreateAssignedShiftDTO, AssignedShiftQueryDTO } from '../../assets/types/types';
import { AssignedShift } from '../../config/postgres/models/assignedShift.model';
import {RequestedShift} from '../../config/postgres/models/requestedShift.model';
import { AvailableShift, Employee } from '../../config/postgres/models';

/**
 * Creates a new assigned shift in the database.
 * @param {CreateAssignedShiftDTO} data - Data for the new assigned shift.
 * @returns {Promise<AssignedShift>} The created assigned shift.
 */
export const createAssignedShift = async (data: CreateAssignedShiftDTO): Promise<AssignedShift> => {
  // Find the available shift and increment shift_slots_taken
  const availableShift = await AvailableShift.findByPk(data.shiftSlotId);
  if (!availableShift) {
    throw new Error('Available shift not found');
  }
  if (availableShift.shift_slots_taken >= availableShift.shift_slots_amount) {
    throw new Error('No available slots for this shift');
  }
  await availableShift.update({ shift_slots_taken: availableShift.shift_slots_taken + 1 });

  const shiftData: any = {
    assigned_shift_id: data.shiftSlotId,
    assigned_employee_id: data.employeeId,
  }; // TODO: Create strict type for shiftData

  const newAssignedShift = await AssignedShift.create(shiftData);
  return newAssignedShift;
};

export const deleteAssignedShift = async (id: number): Promise<boolean> => {
  const assignedShift = await AssignedShift.findOne({ where: { assigned_id: id } });
  if (!assignedShift) return false;

  // Decrement shift_slots_taken for the corresponding available shift
  const availableShift = await AvailableShift.findByPk(assignedShift.assigned_shift_id);
  if (availableShift && availableShift.shift_slots_taken > 0) {
    await availableShift.update({ shift_slots_taken: availableShift.shift_slots_taken - 1 });
  }

  // Delete the requested shift for the same employee and available shift, if exists
  await RequestedShift.destroy({
    where: {
      request_employee_id: assignedShift.assigned_employee_id,
      request_shift_id: assignedShift.assigned_shift_id,
    },
  });

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

export const swapAssignedShifts = async (assignedShift1: number, assignedShift2: number): Promise<AssignedShift[]> => {
  try {
  const shift1 = await AssignedShift.findOne({ where: { assigned_id: assignedShift1 } });
  const shift2 = await AssignedShift.findOne({ where: { assigned_id: assignedShift2 } });
  const employee1Id = shift1?.assigned_employee_id;
  const employee2Id = shift2?.assigned_employee_id;
  const slot1Id = shift1?.assigned_shift_id;
  const slot2Id = shift2?.assigned_shift_id;

  deleteAssignedShift(assignedShift1);
  deleteAssignedShift(assignedShift2);

  const newshift1 = await createAssignedShift({
    employeeId: employee1Id,
    shiftSlotId: slot2Id,} as CreateAssignedShiftDTO);
  const newshift2 = await createAssignedShift({
    employeeId: employee2Id,
    shiftSlotId: slot1Id,} as CreateAssignedShiftDTO);

    return [newshift1, newshift2];
  } catch (error) {
    console.error('Error swapping assigned shifts:', error);
    throw new Error('Failed to swap assigned shifts');
  }
};