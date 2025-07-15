// config/postgres/models/index.ts
import { Sequelize } from 'sequelize-typescript';
import { Employee } from './employee.model';
import { AvailableShift } from './availableShift.model';
import { AssignedShift } from './assignedShift.model';
import { RequestedShift } from './requestedShift.model';
import { ShiftSwapRequest } from './shiftSwapRequest.model';
import { Department } from './department.model';

export function initModels(sequelize: Sequelize): void {
  sequelize.addModels([Employee, AvailableShift, AssignedShift, RequestedShift, ShiftSwapRequest, Department]);
}

export { Employee, AvailableShift, AssignedShift, RequestedShift, ShiftSwapRequest, Department };
