import { ShiftSwapRequest } from '../../config/postgres/models/shiftSwapRequest.model';
import { CreateShiftSwapRequestDTO, RespondShiftSwapRequestDTO, ShiftSwapRequestQueryDTO } from '../../assets/types/types';
import { Op } from 'sequelize'
import { swapAssignedShifts } from './assignedShift.service';
import { getEmployeeById } from './employee.service';
import { getAvailableShiftById } from './availableShift.service';
import { sendEmail } from '../../utils/email';

export const createShiftSwapRequest = async (data: CreateShiftSwapRequestDTO, organization_id: number) => {
  // ...existing code...
  // Fetch shift info for the requester shift
  const shiftInfo = await getAvailableShiftById(data.requester_shift_id, organization_id);
  const result = await ShiftSwapRequest.create({
    ...data,
    organization_id,
    status: 'pending',
  } as any);

  // Fetch source and destination employee emails
  const sourceEmployee = await getEmployeeById(data.requester_employee_id, organization_id);
  const destEmployee = await getEmployeeById(data.target_employee_id, organization_id);

  if (destEmployee && destEmployee.employee_email && sourceEmployee && sourceEmployee.employee_name && shiftInfo) {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif;">
        <img src="https://fillitshifits.com/logo.png" alt="Fillit Logo" style="height:40px;margin-bottom:16px;" />
        <h2>Shift Swap Request</h2>
        <p>Hello ${destEmployee.employee_name},</p>
        <p>You have a new shift swap request from <b>${sourceEmployee.employee_name}</b>.</p>
        <p><b>Shift Details:</b></p>
        <ul>
          <li><b>Date:</b> ${shiftInfo.shift_date}</li>
          <li><b>Start:</b> ${shiftInfo.shift_time_start}</li>
          <li><b>End:</b> ${shiftInfo.shift_time_end}</li>
          <li><b>Department:</b> ${shiftInfo.department?.department_name || 'N/A'}</li>
        </ul>
        <p>Please log in to Fillit to review and respond to this request.</p>
        <hr />
        <small>This is an automated message from Fillit.</small>
      </div>
    `;
    await sendEmail(
      destEmployee.employee_email,
      'Shift Swap Request',
      htmlBody
    );
  }

  return result;
};

export const listShiftSwapRequests = async (query: ShiftSwapRequestQueryDTO) => {
  const { employee_id } = query;
  if (!employee_id) {
    return ShiftSwapRequest.findAll({ where: { organization_id: (query as any).organization_id } });
  }
  // Inbox: requests where target_employee_id = employee_id
  // Outbox: requests where requester_employee_id = employee_id
  return ShiftSwapRequest.findAll({
    where: {
      organization_id: (query as any).organization_id,
      [Op.or]: [
        { requester_employee_id: employee_id },
        { target_employee_id: employee_id },
      ],
    },
    order: [['created_at', 'DESC']],
  });
};

export const respondToShiftSwapRequest = async (id: number, data: RespondShiftSwapRequestDTO, organization_id: number) => {
  const req = await ShiftSwapRequest.findOne({ where: { id, organization_id } });
  if (!req) throw new Error('Shift swap request not found');
  req.status = data.status;
  if (data.message !== undefined) req.message = data.message;
  await req.save();

    // If approved, perform the swap
    if (data.status === 'accepted') {
      await swapAssignedShifts(req.requester_shift_id, req.target_shift_id);

      // Fetch both employees
      const sourceEmployee = await getEmployeeById(req.requester_employee_id, organization_id);
      const destEmployee = await getEmployeeById(req.target_employee_id, organization_id);
      // Fetch shift info for both shifts
      const sourceShift = await getAvailableShiftById(req.requester_shift_id, organization_id);
      const destShift = await getAvailableShiftById(req.target_shift_id, organization_id);

      // Notify both employees
      if (sourceEmployee && sourceEmployee.employee_email && destEmployee && destEmployee.employee_email) {
        // Email to source employee
        const htmlBodySource = `
          <div style="font-family: Arial, sans-serif;">
            <img src="https://fillitshifits.com/logo.png" alt="Fillit Logo" style="height:40px;margin-bottom:16px;" />
            <h2>Shift Swap Approved</h2>
            <p>Hello ${sourceEmployee.employee_name},</p>
            <p>Your shift swap request has been <b>accepted</b> by ${destEmployee.employee_name}.</p>
            <p><b>Your New Shift Details:</b></p>
            <ul>
              <li><b>Date:</b> ${destShift?.shift_date || 'N/A'}</li>
              <li><b>Start:</b> ${destShift?.shift_time_start || 'N/A'}</li>
              <li><b>End:</b> ${destShift?.shift_time_end || 'N/A'}</li>
              <li><b>Department:</b> ${destShift?.department?.department_name || 'N/A'}</li>
            </ul>
            <hr />
            <small>This is an automated message from Fillit.</small>
          </div>
        `;
        await sendEmail(
          sourceEmployee.employee_email,
          'Shift Swap Approved',
          htmlBodySource
        );

        // Email to destination employee
        const htmlBodyDest = `
          <div style="font-family: Arial, sans-serif;">
            <img src="https://fillitshifits.com/logo.png" alt="Fillit Logo" style="height:40px;margin-bottom:16px;" />
            <h2>Shift Swap Approved</h2>
            <p>Hello ${destEmployee.employee_name},</p>
            <p>You have accepted a shift swap request from ${sourceEmployee.employee_name}.</p>
            <p><b>Your New Shift Details:</b></p>
            <ul>
              <li><b>Date:</b> ${sourceShift?.shift_date || 'N/A'}</li>
              <li><b>Start:</b> ${sourceShift?.shift_time_start || 'N/A'}</li>
              <li><b>End:</b> ${sourceShift?.shift_time_end || 'N/A'}</li>
              <li><b>Department:</b> ${sourceShift?.department?.department_name || 'N/A'}</li>
            </ul>
            <hr />
            <small>This is an automated message from Fillit.</small>
          </div>
        `;
        await sendEmail(
          destEmployee.employee_email,
          'Shift Swap Approved',
          htmlBodyDest
        );
      }
    }

  return req;
}