//import { Employee } from '../config/postgres/models';
import { CreateEmployeeDTO, UpdateEmployeeDTO , EmployeeQueryDTO} from '../../assets/types/types';
import { Employee } from '../../config/postgres/models/employee.model'; 

/**
 * Creates a new employee in the database.
 * @param {CreateEmployeeDTO} data - Employee data to create.
 * @returns {Promise<Employee>} The created employee.
 */
export const createEmployee = async (data: CreateEmployeeDTO): Promise<Employee> => {
  const newEmployee = await Employee.create({
    employee_name: data.name,
    employee_email: data.email,
    employee_phone: data.phone, 
    employee_password: data.password,
  } as any); 

  return newEmployee;
};

/**
 * Retrieves an employee by their ID, excluding the password field.
 * @param {number} id - Employee ID.
 * @returns {Promise<Omit<Employee, 'employee_password'> | null>} The employee or null if not found.
 */
export const getEmployeeById = async (id: number): Promise<Omit<Employee, 'employee_password'> | null> => {
  if (!Number.isInteger(id)) {
    throw new Error(`Invalid employee ID: ${id}`);
  }

  const employee = await Employee.findOne({
    where: { employee_id: id },
    attributes: { exclude: ['employee_password'] }
  });

  return employee;
};

/**
 * Retrieves an employee by their email, excluding the password field.
 * @param {string} email - Employee email.
 * @returns {Promise<Employee | null>} The employee or null if not found.
 */
export const getEmployeeByEmail = async (email: string): Promise<Employee | null> => {
  const employee = await Employee.findOne({
    where: { employee_email: email.trim() }, // Ensure email is trimmed to avoid mismatches
    attributes: { exclude: ['employee_password'] }
  });
  return employee;
};

/**
 * Checks if an employee exists by their email.
 * @param {string} email - Employee email.
 * @returns {Promise<boolean>} True if the employee exists, false otherwise.
 */
export const isEmployeeExistsByEmail = async (email: string): Promise<boolean> => {
  const employee = await Employee.findOne({
    where: { employee_email: email.trim() },
    attributes: ['employee_id'] // Only fetch the ID to optimize the query
  });
  return !!employee;
};

/**
 * Retrieves employees based on query parameters.
 * @param {ParsedQs} params - Query parameters (e.g., admin status).
 * @returns {Promise<Employee[]>} A list of employees matching the filters.
 */
export const getEmployeesByParams = async (params: EmployeeQueryDTO): Promise<Employee[]> => {

  const employees = await Employee.findAll({
    where: params,
    attributes: { exclude: ['employee_password'] }
  });
  return employees;
}

/**
 * Deletes an employee by their ID.
 * @param {number} id - Employee ID.
 * @returns {Promise<boolean>} True if the employee was deleted, false otherwise.
 */
export const deleteEmployee = async (id: number): Promise<boolean> => {
  const employee = await Employee.findOne({ where: { employee_id: id } });
  if (!employee) return false;

  await employee.destroy();
  return true;
};

/**
 * Updates an employee's details by their ID.
 * @param {number} id - Employee ID.
 * @param {UpdateEmployeeDTO} data - Partial employee data to update.
 * @returns {Promise<Omit<Employee, 'employee_password'> | null>} The updated employee or null if not found.
 */
export const updateEmployee = async (id: number, data: UpdateEmployeeDTO): Promise<Omit<Employee, 'employee_password'> | null> => {
  const employee = await Employee.findOne({ where: { employee_id: id } });
  if (!employee) return null;

  // Dynamically map the incoming data fields to the database column names
  const mappedData = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [`employee_${key}`, value])
  );

  // Update the employee with the mapped data
  await employee.update(mappedData);

  // Exclude the password field from the returned employee object
  const updatedEmployee = await Employee.findOne({
    where: { employee_id: id },
    attributes: { exclude: ['employee_password'] }
  });

  return updatedEmployee;
};

/**
 * Updates only the admin status of an employee by their ID.
 * @param {number} id - Employee ID.
 * @param {boolean} admin - The new admin status.
 * @returns {Promise<Omit<Employee, 'employee_password'> | null>} The updated employee or null if not found.
 */
export const updateEmployeeAdminStatus = async (id: number, admin: boolean): Promise<Omit<Employee, 'employee_password'> | null> => {
  const employee = await Employee.findOne({ where: { employee_id: id } });
  if (!employee) return null;

  // Print the employee email for debugging
  console.log('Employee email:', employee.employee_email);

  // Only update the admin status
  await employee.update({ employee_admin: admin });

  // Fetch the updated employee, excluding the password
  const updatedEmployee = await Employee.findOne({
    where: { employee_id: id },
    attributes: { exclude: ['employee_password'] }
  });

  // Type assertion to Omit<Employee, 'employee_password'> for correct return type
  return updatedEmployee as Omit<Employee, 'employee_password'> | null;
};