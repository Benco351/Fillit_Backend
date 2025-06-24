import { Employee } from '../../config/postgres/models/employee.model';

export const loginEmployeeService = async (email: string, password: string) => {
  const employee = await Employee.findOne({ where: { employee_email: email } });
  if (!employee) return null;
  const isValid = await employee.validatePassword(password);
  if (!isValid) return null;
  return {
    employee_id: employee.employee_id,
    employee_admin: employee.employee_admin,
    employee_name: employee.employee_name,
    employee_email: employee.employee_email,
  };
}; 