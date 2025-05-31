-- ========== CLEAN-UP BLOCK ==========
DO $$
BEGIN
    -- drop tables that reference others first
    IF to_regclass('public.requested_shifts') IS NOT NULL THEN
        EXECUTE 'DROP TABLE requested_shifts CASCADE';
    END IF;

    IF to_regclass('public.assigned_shifts') IS NOT NULL THEN
        EXECUTE 'DROP TABLE assigned_shifts CASCADE';
    END IF;

    -- available_shifts (referenced by both tables)
    IF to_regclass('public.available_shifts') IS NOT NULL THEN
        EXECUTE 'DROP TABLE available_shifts CASCADE';
    END IF;

    -- finally the employees master table
    IF to_regclass('public.employees') IS NOT NULL THEN
        EXECUTE 'DROP TABLE employees CASCADE';
    END IF;

    -- drop the enum type if it survives the CASCADE
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_requested_shifts_request_status') THEN
        EXECUTE 'DROP TYPE enum_requested_shifts_request_status';
    END IF;
END
$$;
