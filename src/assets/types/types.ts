import { z } from 'zod';

/* ---------- Assigned Shift Types ---------- */
export const CreateAssignedShiftSchema = z.object({
    employeeId: z.number(),
    shiftSlotId: z.number(),
    organization_id: z.coerce.number(),
}).strict();

export const AssignedShiftQuerySchema = z.object({
    assigned_employee_id: z.coerce.number().optional(),
    organization_id: z.coerce.number(),
}).strict();

export const swapAssignedShiftsSchema = z.object({
    assignedShiftId1: z.coerce.number(),
    assignedShiftId2: z.coerce.number(),
    organization_id: z.coerce.number(),
}).strict();

export type SwapAssignedShiftsDTO = z.infer<typeof swapAssignedShiftsSchema>;
export type CreateAssignedShiftDTO = z.infer<typeof CreateAssignedShiftSchema>;
export type AssignedShiftQueryDTO = z.infer<typeof AssignedShiftQuerySchema>;

/* ---------- Available Shift Types ---------- */
export const CreateAvailableShiftSchema = z.object({
    date: z.coerce.date(),
    start: z.string().time(), 
    end: z.string().time(),
    shift_slots_amount: z.coerce.number().int().min(1).optional(), // Added field
    department_id: z.coerce.number().optional(),
    organization_id: z.coerce.number(),
}).strict();

export const UpdateAvailableShiftSchema = z.object({
    date: z.coerce.date().optional(), 
    start: z.string().time().optional(), 
    end: z.string().time().optional(),
    shift_slots_amount: z.coerce.number().int().min(1).optional(), // Added field
    department_id: z.coerce.number().optional(),
    // organization_id accepted for scoping but ignored for update
    organization_id: z.coerce.number().optional(),
}).strict();

export const AvailableShiftQuerySchema = z.object({
    shift_date: z.coerce.date().optional(), 
    shift_start_date: z.coerce.date().optional(),
    shift_end_date: z.coerce.date().optional(),
    shift_start_before: z.string().time().optional(), 
    shift_start_after: z.string().time().optional(), 
    shift_end_before: z.string().time().optional(), 
    shift_end_after: z.string().time().optional(),
    shift_slots_amount: z.coerce.number().int().optional(), // Added field
    shift_slots_taken: z.coerce.number().int().optional(), // Added field
    department: z.coerce.number().optional(), // New: filter by department id
    organization_id: z.coerce.number(),
}).strict();

export type CreateAvailableShiftDTO = z.infer<typeof CreateAvailableShiftSchema>;
export type UpdateAvailableShiftDTO = z.infer<typeof UpdateAvailableShiftSchema>;
export type AvailableShiftQueryDTO = z.infer<typeof AvailableShiftQuerySchema>;

/* ---------- Employee Types ---------- */
export const CreateEmployeeSchema = z.object({
    name: z.string().nonempty(),
    email: z.string().email(),
    password: z.string().min(1),
    phone: z.string().optional(),
    organization_id: z.coerce.number().optional(),
    admin: z.boolean().optional(),
}).strict();

export const UpdateEmployeeSchema = z.object({
    name: z.string().nonempty().optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    admin: z.boolean().optional(),
    phone: z.string().optional(),
    organization_id: z.coerce.number().optional(),
}).strict();

export const EmployeeQuerySchema = z.object({
    employee_admin: z.enum(['true', 'false']).optional(),
    organization_id: z.coerce.number(),
}).strict();

export type CreateEmployeeDTO = z.infer<typeof CreateEmployeeSchema>;
// Now CreateEmployeeDTO includes optional admin property
export type UpdateEmployeeDTO = z.infer<typeof UpdateEmployeeSchema>;
export type EmployeeQueryDTO = z.infer<typeof EmployeeQuerySchema>;

/* ---------- Requested Shift Types ---------- */
export const CreateRequestedShiftSchema = z.object({
    employeeId: z.number(),
    shiftSlotId: z.number(),
    notes: z.string().optional(),
    organization_id: z.coerce.number(),
}).strict();

export const UpdateRequestedShiftSchema = z.object({
    status: z.enum(['pending', 'approved', 'denied', 'swapped']).optional(),
    notes: z.string().optional(),
    organization_id: z.coerce.number().optional(),
}).strict();

export const RequestedShiftQuerySchema = z.object({
    request_employee_id: z.coerce.number().optional(),
    request_status: z.enum(['pending', 'approved', 'denied', 'swapped']).optional(),
    organization_id: z.coerce.number(),
}).strict();

export type CreateRequestedShiftDTO = z.infer<typeof CreateRequestedShiftSchema>;
export type UpdateRequestedShiftDTO = z.infer<typeof UpdateRequestedShiftSchema>;
export type RequestedShiftQueryDTO = z.infer<typeof RequestedShiftQuerySchema>;

/* ---------- Add to Group Types ---------- */
export const AddtoGroupSchema = z.object({
    email: z.string().email(),
    group: z.string().nonempty(),
}).strict();

export type AddtoGroupDTO = z.infer<typeof RequestedShiftQuerySchema>;

/* ---------- Admin Assignment Types ---------- */
export const AssignAdminSchema = z.object({
    admin: z.boolean(),
    organization_id: z.coerce.number(),
}).strict();

export type AssignAdminDTO = z.infer<typeof AssignAdminSchema>;

/* ---------- Shift Swap Request Types ---------- */
export const CreateShiftSwapRequestSchema = z.object({
    requester_employee_id: z.number(),
    target_employee_id: z.number(),
    requester_shift_id: z.number(),
    target_shift_id: z.number(),
    message: z.string().optional(),
    organization_id: z.coerce.number(),
}).strict();

export const RespondShiftSwapRequestSchema = z.object({
    status: z.enum(['accepted', 'rejected', 'cancelled']),
    message: z.string().optional(),
    organization_id: z.coerce.number(),
}).strict();

export const ShiftSwapRequestQuerySchema = z.object({
    employee_id: z.coerce.number().optional(),
    organization_id: z.coerce.number(),
}).strict();

export type CreateShiftSwapRequestDTO = z.infer<typeof CreateShiftSwapRequestSchema>;
export type RespondShiftSwapRequestDTO = z.infer<typeof RespondShiftSwapRequestSchema>;
export type ShiftSwapRequestQueryDTO = z.infer<typeof ShiftSwapRequestQuerySchema>;

/* ---------- Department Types ---------- */
export const CreateDepartmentSchema = z.object({
    name: z.string().nonempty(),
    address: z.string().optional(),
    organization_id: z.coerce.number(),
}).strict();

export const UpdateDepartmentSchema = z.object({
    name: z.string().nonempty().optional(),
    address: z.string().optional(),
    organization_id: z.coerce.number().optional(),
}).strict();

export const DepartmentQuerySchema = z.object({
    department_id: z.coerce.number().optional(),
    name: z.string().optional(),
    organization_id: z.coerce.number(),
}).strict();

export type CreateDepartmentDTO = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartmentDTO = z.infer<typeof UpdateDepartmentSchema>;
export type DepartmentQueryDTO = z.infer<typeof DepartmentQuerySchema>;

/* ---------- Organization Types ---------- */
export const CreateOrganizationSchema = z.object({
    organization: z.object({
        name: z.string().nonempty(),
    }),
    admin: z.object({
        name: z.string().nonempty(),
        email: z.string().email(),
        phone: z.string().optional(),
        password: z.string().min(1),
    })
}).strict();

export const OrganizationQuerySchema = z.object({
    organization_id: z.coerce.number().optional(),
    name: z.string().optional(),
}).strict();

export type CreateOrganizationDTO = z.infer<typeof CreateOrganizationSchema>;
export type OrganizationQueryDTO = z.infer<typeof OrganizationQuerySchema>;

/* ---------- Announcement Types ---------- */
export const CreateAnnouncementSchema = z.object({
    author_id: z.coerce.number(),
    title: z.string().nonempty(),
    content: z.string().nonempty(),
    start_date: z.coerce.date().optional(), // Allow start_date to be provided
}).strict();

export const UpdateAnnouncementSchema = z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
}).strict();

export const AnnouncementQuerySchema = z.object({
    title: z.string().optional(),
    author_id: z.coerce.number().optional(),
}).strict();

export type CreateAnnouncementDTO = z.infer<typeof CreateAnnouncementSchema>;
export type UpdateAnnouncementDTO = z.infer<typeof UpdateAnnouncementSchema>;
export type AnnouncementQueryDTO = z.infer<typeof AnnouncementQuerySchema>;