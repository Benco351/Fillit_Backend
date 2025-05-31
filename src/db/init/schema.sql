BEGIN;

-- export DATABASE_URL="postgresql://fillituser:6PaW5jPGF7G2wCM23goS@fillitdbinstance.c6vwei6wo4pe.us-east-1.rds.amazonaws.com:5432/fillitdb?sslmode=require"

-- Drop old objects (so you can re‑run cleanly)
DROP TABLE IF EXISTS requested_shifts CASCADE;
DROP TABLE IF EXISTS assigned_shifts CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS available_shifts CASCADE;
DROP TYPE  IF EXISTS enum_requested_shifts_request_status;

/* Available shifts */
CREATE TABLE available_shifts (
  shift_id           SERIAL PRIMARY KEY,
  shift_date         DATE,
  shift_slots_amount INTEGER  NOT NULL,
  shift_slots_taken  INTEGER  DEFAULT 0,
  shift_time_start   TIME(6),
  shift_time_end     TIME(6)
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
COMMIT;
