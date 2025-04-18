export const InvalidAssignedShiftId = "Invalid assigned shift ID. Must be a number.";
export const InvalidShiftAssignId = "Invalid Shift Assign ID. Must be a number.";
export const AvailableShiftNotFound = "Available shift not found";
export const AssignedShiftAlreadyExists = "Assigned shift already exists for this employee and shift slot";
export const AssignedShiftNotFound = "Assigned shift not found";
export const AssignedShiftMissing = "Assigned Shift not found";
export const NoAssignedShiftsFound = "No assigned shifts found";
export const CreatedAssignedShiftLog = (id: number) => `Created shift assign ${id}`;
export const FetchedAssignedShiftsLog = "Fetched assigned shifts";
export const GetAssignedShiftsErrorLog = (err: unknown) => `getAssignedShift error: ${err}`;
export const CreateAssignedShiftErrorLog = (err: unknown) => `createAssignedShift: ${err}`;
export const AssignedShiftCreated = "Shift assign created";
export const AssignedShiftDeleted = "Assigned shift deleted";
export const AssignedShiftsRetrieved = "Assigned shifts retrieved successfully";

