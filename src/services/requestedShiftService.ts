import { CreateRequestedShiftDTO, UpdateRequestedShiftDTO} from '../types/requestedShiftSchema';
import { RequestedShift } from '../config/postgres/models/requestedShift.model'; 
import { ParsedQs } from 'qs'; // Import ParsedQs for query parameters
import { request } from 'http';
import { AvailableShift, Employee } from '../config/postgres/models';
import { RequestStatus } from '../config/postgres/models/requestedShift.model';


export const createRequestedShift = async (data: CreateRequestedShiftDTO): Promise<RequestedShift> => {
  const newRequestedShift = await RequestedShift.create({
    request_shift_id: data.shiftSlotId,
    request_employee_id: data.employeeId,
    ...(data.notes && { request_notes: data.notes })
  } as any); 

  return newRequestedShift;
};


export const getRequestedShiftById = async (id: number): Promise<RequestedShift| null> => {
  if (!Number.isInteger(id)) {
    throw new Error(`Invalid available shift ID: ${id}`);
  }
  const requestedShift = await RequestedShift.findOne({
    where: { request_id: id },
  });

  return requestedShift;
};

export const getRequestedShiftsByParams = async (params: ParsedQs): Promise<RequestedShift[]> => {
  const filters: any = {};

  // Check if employee ID is provided
  if (params.employeeId !== undefined) {
    if (!Number.isInteger(Number(params.employeeId))) {
      throw new Error(`Invalid employee ID: ${params.employeeId}`);
    }
    filters.request_employee_id = params.employeeId;
  }

  // Check if status is provided and valid
  if (params.status !== undefined) {
    if (!Object.values(RequestStatus).includes(params.status as RequestStatus)) {
      throw new Error(`Invalid status: ${params.status}`);
    }
    filters.request_status = params.status;
  }

  const requestedShifts = await RequestedShift.findAll({
    where: filters,
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

export const deleteRequestedShift = async (id: number): Promise<boolean> => {
  const deletedCount = await RequestedShift.destroy({
    where: { request_id: id },
  });

  return deletedCount > 0;
};

export const updateRequestedShift = async (id: number, data: UpdateRequestedShiftDTO): Promise<RequestedShift | null> => {
  const requestedShift = await RequestedShift.findOne({ where: { request_id: id } });
  if (!requestedShift) return null;

  if (data.status) {
    await requestedShift.update({ request_status: data.status as RequestStatus });
  }

  return requestedShift;
};