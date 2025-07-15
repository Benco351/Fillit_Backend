import { CreateDepartmentDTO, UpdateDepartmentDTO, DepartmentQueryDTO } from '../../assets/types/types';
import { Department } from '../../config/postgres/models/department.model';
import { Op } from 'sequelize';

export const createDepartment = async (data: CreateDepartmentDTO): Promise<Department> => {
  const department = await Department.create({
    department_name: data.name,
    department_address: data.address ?? null,
  } as any);
  return department;
};

export const getDepartmentById = async (id: number): Promise<Department | null> => {
  if (!Number.isInteger(id)) {
    throw new Error(`Invalid department ID: ${id}`);
  }
  return Department.findOne({ where: { department_id: id } });
};

export const getDepartmentsByParams = async (params: DepartmentQueryDTO): Promise<Department[]> => {
  const filters: Record<string, unknown> = {};
  if (params.department_id) filters.department_id = params.department_id;
  if (params.name) filters.department_name = { [Op.iLike]: `%${params.name}%` };
  return Department.findAll({ where: filters });
};

export const deleteDepartment = async (id: number): Promise<boolean> => {
  const department = await Department.findOne({ where: { department_id: id } });
  if (!department) return false;
  await department.destroy();
  return true;
};

export const updateDepartment = async (id: number, data: UpdateDepartmentDTO): Promise<Department | null> => {
  const department = await Department.findOne({ where: { department_id: id } });
  if (!department) return null;
  // Only allow updating the address
  if (data.address !== undefined) {
    await department.update({ department_address: data.address });
  }
  return department;
}; 