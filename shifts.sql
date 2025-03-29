CREATE TABLE general_addresses (
address_id serial PRIMARY KEY,
address_country varchar(100) NULL DEFAULT NULL,
address_city varchar(100) NULL DEFAULT NULL,
address_street varchar(100) NULL DEFAULT NULL,
postal_code varchar(20) NULL DEFAULT NULL,
address_additional_info text NULL DEFAULT NULL
);

CREATE TABLE organization_roles (
role_id serial PRIMARY KEY,
role_name varchar(100) NOT NULL,
role_description text NULL DEFAULT NULL
);

CREATE TABLE organization_admins (
admin_id serial PRIMARY KEY
);

CREATE TABLE organization_permissions (
permission_id serial PRIMARY KEY,
permission_admin_id_fkey integer NOT NULL,
permission_name varchar(100) NOT NULL,
permission_text text  NULL DEFAULT NULL,
FOREIGN KEY (permission_admin_id_fkey) REFERENCES organization_admins(admin_id)
);

CREATE TABLE employees (
employee_id serial PRIMARY KEY,
employee_name varchar(255) NOT NULL,
employee_email varchar(255) NOT NULL,
employee_phone varchar(20) NULL DEFAULT NULL,
employee_password varchar(255) NOT NULL,
employee_role_id_fkey integer NULL DEFAULT NULL,
employee_address_id_fkey integer NULL DEFAULT NULL,
employee_is_admin_fkey integer NULL DEFAULT NULL,
FOREIGN KEY (employee_role_id_fkey) REFERENCES organization_roles(role_id),
FOREIGN KEY (employee_address_id_fkey) REFERENCES general_addresses(address_id),
FOREIGN KEY (employee_is_admin_fkey) REFERENCES organization_admins(admin_id)
);

CREATE TABLE organizations(
organization_id serial PRIMARY KEY,
organization_name varchar(255) NOT NULL,
organization_password varchar(255) NOT NULL
);

CREATE TABLE organization_groups(
    organization_group_id serial PRIMARY KEY,
    organization_group_name varchar(100) NOT NULL
);

CREATE TABLE employee_groups (
    etog_group_id_fkey integer NOT NULL,
    etog_employee_id_fkey integer NOT NULL,
    PRIMARY KEY (etog_group_id_fkey, etog_employee_id_fkey),
    FOREIGN KEY (etog_employee_id_fkey) REFERENCES employees(employee_id),
    FOREIGN KEY (etog_group_id_fkey) REFERENCES organization_groups(organization_group_id)
);


CREATE TABLE recipients (
    recipients_group_id_fkey integer NOT NULL,
    recipients_announcment_id_key integer NOT NULL,
    PRIMARY KEY (recipients_group_id_fkey, recipients_announcment_id_fkey),
    FOREIGN KEY (recipients_group_id_fkey) REFERENCES organization_groups(organization_group_id),
);

CREATE TABLE departments (
    department_id serial PRIMARY KEY,
    department_name varchar(100) NOT NULL,
    department_address_id_fkey integer NULL DEFAULT NULL,
    department_manager_id_fkey integer NULL DEFAULT NULL,
    FOREIGN KEY (department_address_id_fkey) REFERENCES general_addresses(address_id),
    FOREIGN KEY (department_manager_id_fkey) REFERENCES employees(employee_id)
);

CREATE TABLE sub_departments (
    sub_department_id serial PRIMARY KEY,
    sub_department_name varchar(100) NOT NULL,
    sub_department_capacity integer NULL DEFAULT NULL,
    main_department_id_fkey integer NOT NULL,
    sub_department_manager_id_fkey integer NULL DEFAULT NULL,
    FOREIGN KEY (main_department_id_fkey) REFERENCES departments(department_id),
    FOREIGN KEY (sub_department_manager_id_fkey) REFERENCES employees(employee_id)
);

CREATE TABLE avaliable_shifts (
    shift_id serial PRIMARY KEY,
    shift_date date NULL DEFAULT NULL,
    shift_time_start time(6) NULL DEFAULT NULL,
    shift_time_end time(6) NULL DEFAULT NULL,
    sub_department_id_fkey integer NULL DEFAULT NULL,
    FOREIGN KEY (sub_department_id_fkey) REFERENCES sub_departments(sub_department_id)
);

CREATE TABLE assigned_shifts (
    assigned_id serial PRIMARY KEY,
    assigned_shift_id_fkey integer NOT NULL,
    assigned_employee_id_fkey integer NOT NULL,
    FOREIGN KEY (assigned_shift_id_fkey) REFERENCES avaliable_shifts(shift_id),
    FOREIGN KEY (assigned_employee_id_fkey) REFERENCES employees(employee_id)
);

CREATE TYPE request_status AS ENUM ('pending', 'approved', 'denied');

CREATE TABLE requested_shifts (
    request_id serial PRIMARY KEY,
    request_shift_id integer NOT NULL,
    request_employee_id integer NOT NULL,
    request_notes text NULL DEFAULT NULL,
    request_status request_status DEFAULT 'pending',
    FOREIGN KEY (request_shift_id_fkey) REFERENCES avaliable_shifts(shift_id),
    FOREIGN KEY (request_employee_id_fkey) REFERENCES employees(employee_id)
);
