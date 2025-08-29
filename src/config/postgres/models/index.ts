// config/postgres/models/index.ts
import { Sequelize } from 'sequelize-typescript';
import { Organization } from './organization.model';
import { Department } from './department.model';
import { Employee } from './employee.model';
import { AvailableShift } from './availableShift.model';
import { AssignedShift } from './assignedShift.model';
import { RequestedShift } from './requestedShift.model';
import { ShiftSwapRequest } from './shiftSwapRequest.model';

export function initModels(sequelize: Sequelize): void {
  // Register in dependency order so sync creates base tables first
  sequelize.addModels([Organization, Department, Employee, AvailableShift, AssignedShift, RequestedShift, ShiftSwapRequest]);
}

export { Employee, AvailableShift, AssignedShift, RequestedShift, ShiftSwapRequest, Department, Organization };
