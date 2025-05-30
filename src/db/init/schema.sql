-- Drop old objects (so you can re‑run cleanly)
DROP TABLE IF EXISTS requested_shifts CASCADE;
DROP TABLE IF EXISTS assigned_shifts CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS available_shifts CASCADE;
DROP TYPE  IF EXISTS enum_requested_shifts_request_status;

-- Available shifts
CREATE TABLE available_shifts (
  shift_id          SERIAL PRIMARY KEY,
  shift_date        DATE,
  shift_slots_amount INTEGER NOT NULL,
  shift_slots_taken  INTEGER DEFAULT 0,
  shift_time_start  TIME(6),
  shift_time_end    TIME(6)
);

-- Employees
CREATE TABLE employees (
  employee_id       SERIAL PRIMARY KEY,
  employee_name     VARCHAR(255) NOT NULL,
  employee_email    VARCHAR(255) NOT NULL,
  employee_phone    VARCHAR(20),
  employee_password VARCHAR(255) NOT NULL,
  employee_admin    BOOLEAN DEFAULT FALSE
);

-- Assigned shifts
CREATE TABLE assigned_shifts (
  assigned_id           SERIAL PRIMARY KEY,
  assigned_shift_id     INTEGER NOT NULL
    REFERENCES available_shifts(shift_id),
  assigned_employee_id  INTEGER NOT NULL
    REFERENCES employees(employee_id)
);

-- Enum for requested‑shifts
CREATE TYPE enum_requested_shifts_request_status
  AS ENUM ('pending','approved','denied');

-- Requested shifts
CREATE TABLE requested_shifts (
  request_id          SERIAL PRIMARY KEY,
  request_shift_id    INTEGER NOT NULL
    REFERENCES available_shifts(shift_id),
  request_employee_id INTEGER NOT NULL
    REFERENCES employees(employee_id),
  request_notes       TEXT,
  request_status      enum_requested_shifts_request_status
    DEFAULT 'pending'
);