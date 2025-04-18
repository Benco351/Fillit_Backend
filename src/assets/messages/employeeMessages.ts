export const InvalidEmployeeId = "Invalid employee ID. Must be a number.";
export const EmailAlreadyTaken = "This email is already taken by another employee.";
export const EmployeeNotFound = "Employee not found";
export const EmployeeUpdated = "Employee updated";
export const NoEmployeesFound = "No employees found";
export const EmployeeCreated = "Employee created";
export const EmployeeDeleted = "Employee deleted";
export const EmailExists = "An employee with this email already exists.";
export const FetchedEmployees = "Fetched employees";
export const InvalidAdminFilterValue = "Invalid admin filter value. Must be 'true' or 'false'.";
export const EmployeeId = "employee id";
export const InvalidEmployeeIdStart = "Invalid employee ID";
export const UpdateEmployeeLog = (err: unknown) => `updateEmployee error: ${err}`;
export const GetEmployeesErrorLog = (err: unknown) => `getEmployees error: ${err}`;
export const GetEmployeeErrorLog = (err: unknown) => `getEmployee error: ${err}`;
export const CreateEmployeeErrorLog = (err: unknown) => `createEmployee error: ${err}`;
export const CreatedEmployeeLog = (id: number) => `Created employee ${id}`;

