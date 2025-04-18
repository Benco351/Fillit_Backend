    CREATE TABLE avaliable_shifts (
        shift_id serial PRIMARY KEY,
        shift_date date NULL DEFAULT NULL,
        shift_time_start time(6) NULL DEFAULT NULL,
        shift_time_end time(6) NULL DEFAULT NULL,
    
    );


    CREATE TABLE employees (
    employee_id serial PRIMARY KEY,
    employee_name varchar(255) NOT NULL,
    employee_email varchar(255) NOT NULL,
    employee_phone varchar(20) NULL DEFAULT NULL,
    employee_password varchar(255) NOT NULL,
    employee_admin boolean DEFAULT FALSE,
    );



    CREATE TABLE assigned_shifts (
        assigned_id serial PRIMARY KEY,
        assigned_shift_id integer NOT NULL,
        assigned_employee_id integer NOT NULL,
        FOREIGN KEY (assigned_shift_id) REFERENCES avaliable_shifts(shift_id),
        FOREIGN KEY (assigned_employee_id) REFERENCES employees(employee_id)
    );

CREATE TYPE enum_requested_shifts_request_status AS ENUM ('pending', 'approved', 'denied');


CREATE TABLE requested_shifts (
    request_id serial PRIMARY KEY,
    request_shift_id integer NOT NULL,
    request_employee_id integer NOT NULL,
    request_notes text NULL DEFAULT NULL,
    request_status enum_requested_shifts_request_status DEFAULT 'pending',
    FOREIGN KEY (request_shift_id) REFERENCES avaliable_shifts(shift_id),
    FOREIGN KEY (request_employee_id) REFERENCES employees(employee_id)
);
