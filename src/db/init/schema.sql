BEGIN;

-- export DATABASE_URL="postgresql://fillituser:6PaW5jPGF7G2wCM23goS@fillitdbinstance.c6vwei6wo4pe.us-east-1.rds.amazonaws.com:5432/fillitdb?sslmode=require"

-- Drop old objects (so you can re‑run cleanly)
DROP TABLE IF EXISTS requested_shifts CASCADE;
DROP TABLE IF EXISTS assigned_shifts CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS available_shifts CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TYPE  IF EXISTS enum_requested_shifts_request_status;
DROP TYPE  IF EXISTS enum_shift_swap_status;

/* Available shifts */
CREATE TABLE available_shifts (
  shift_id           SERIAL PRIMARY KEY,
  shift_date         DATE,
  shift_slots_amount INTEGER  NOT NULL,
  shift_slots_taken  INTEGER  DEFAULT 0,
  shift_time_start   TIME(6),
  shift_time_end     TIME(6),
  department_id      INTEGER,
  CONSTRAINT fk_available_shift_department
      FOREIGN KEY (department_id)
      REFERENCES departments (department_id)
      ON DELETE CASCADE
);

/* Departments */
CREATE TABLE departments (
  department_id      SERIAL PRIMARY KEY,
  department_name    VARCHAR(255) NOT NULL,
  department_address VARCHAR(255)
);

/* Employees */
CREATE TABLE employees (
  employee_id       SERIAL PRIMARY KEY,
  employee_name     VARCHAR(255) NOT NULL,
  employee_email    VARCHAR(255) NOT NULL,
  employee_phone    VARCHAR(20),
  employee_password VARCHAR(255) NOT NULL,
  employee_admin    BOOLEAN      DEFAULT FALSE
);

/* ──────────────────────────────────────────
   CHILD TABLES WITH EXPLICIT FK NAMES
   AND  ON DELETE CASCADE
   ────────────────────────────────────────── */

/* Assigned shifts */
CREATE TABLE assigned_shifts (
  assigned_id           SERIAL PRIMARY KEY,

  assigned_shift_id     INTEGER NOT NULL,
  assigned_employee_id  INTEGER NOT NULL,

  CONSTRAINT fk_assigned_shift
      FOREIGN KEY (assigned_shift_id)
      REFERENCES available_shifts (shift_id)
      ON DELETE CASCADE,

  CONSTRAINT fk_assigned_employee
      FOREIGN KEY (assigned_employee_id)
      REFERENCES employees (employee_id)
      ON DELETE CASCADE
);

/* Enum for requested-shifts status */
CREATE TYPE enum_requested_shifts_request_status
  AS ENUM ('pending', 'approved', 'denied');

/* Requested shifts */
CREATE TABLE requested_shifts (
  request_id          SERIAL PRIMARY KEY,

  request_shift_id    INTEGER NOT NULL,
  request_employee_id INTEGER NOT NULL,
  request_notes       TEXT,
  request_status      enum_requested_shifts_request_status
                      DEFAULT 'pending',

  CONSTRAINT fk_requested_shift
      FOREIGN KEY (request_shift_id)
      REFERENCES available_shifts (shift_id)
      ON DELETE CASCADE,

  CONSTRAINT fk_requested_employee
      FOREIGN KEY (request_employee_id)
      REFERENCES employees (employee_id)
      ON DELETE CASCADE
);

/* Enum for shift swap status */
CREATE TYPE enum_shift_swap_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

/* Shift swap requests */
CREATE TABLE shift_swap_requests (
  id SERIAL PRIMARY KEY,
  requester_employee_id INTEGER NOT NULL,
  target_employee_id INTEGER NOT NULL,
  requester_shift_id INTEGER NOT NULL,
  target_shift_id INTEGER NOT NULL,
  status enum_shift_swap_status DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_swap_requester_employee
    FOREIGN KEY (requester_employee_id)
    REFERENCES employees (employee_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_swap_target_employee
    FOREIGN KEY (target_employee_id)
    REFERENCES employees (employee_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_swap_requester_shift
    FOREIGN KEY (requester_shift_id)
    REFERENCES assigned_shifts (assigned_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_swap_target_shift
    FOREIGN KEY (target_shift_id)
    REFERENCES assigned_shifts (assigned_id)
    ON DELETE CASCADE
);
COMMIT;
