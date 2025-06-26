import { ShiftSwapRequest } from '../../config/postgres/models/shiftSwapRequest.model';
import { CreateShiftSwapRequestDTO, RespondShiftSwapRequestDTO, ShiftSwapRequestQueryDTO } from '../../assets/types/types';
import { Op } from 'sequelize';
import { swapAssignedShifts } from './assignedShift.service';

export const createShiftSwapRequest = async (data: CreateShiftSwapRequestDTO) => {
  return ShiftSwapRequest.create({
    ...data,
    status: 'pending',
  } as any);
};

export const listShiftSwapRequests = async (query: ShiftSwapRequestQueryDTO) => {
  const { employee_id } = query;
  if (!employee_id) {
    return ShiftSwapRequest.findAll();
  }
  // Inbox: requests where target_employee_id = employee_id
  // Outbox: requests where requester_employee_id = employee_id
  return ShiftSwapRequest.findAll({
    where: {
      [Op.or]: [
        { requester_employee_id: employee_id },
        { target_employee_id: employee_id },
      ],
    },
    order: [['created_at', 'DESC']],
  });
};

export const respondToShiftSwapRequest = async (id: number, data: RespondShiftSwapRequestDTO) => {
  const req = await ShiftSwapRequest.findByPk(id);
  if (!req) throw new Error('Shift swap request not found');
  req.status = data.status;
  if (data.message !== undefined) req.message = data.message;
  await req.save();

  // If approved, perform the swap
  if (data.status === 'accepted') {
    await swapAssignedShifts(req.requester_shift_id, req.target_shift_id);
  }

  return req;
}; 