-- Add missing columns to candidate table
ALTER TABLE public.candidate ADD COLUMN IF NOT EXISTS cv_file_path TEXT;
ALTER TABLE public.candidate ADD COLUMN IF NOT EXISTS hiring_stage TEXT;