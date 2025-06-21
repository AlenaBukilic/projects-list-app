-- Migration script to add new columns to existing projects table
-- Run this if you already have a projects table with data

-- Add new columns if they don't exist
DO $$ 
BEGIN
    -- Add place column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'place') THEN
        ALTER TABLE projects ADD COLUMN place VARCHAR(255) NOT NULL DEFAULT 'Unknown';
    END IF;
    
    -- Add user column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'user') THEN
        ALTER TABLE projects ADD COLUMN "user" VARCHAR(255) NOT NULL DEFAULT 'Unknown';
    END IF;
END $$;

-- Update existing records with sample data for the new columns
UPDATE projects SET 
    place = CASE 
        WHEN "project id" = 1 THEN 'New York'
        WHEN "project id" = 2 THEN 'San Francisco'
        WHEN "project id" = 3 THEN 'Chicago'
        WHEN "project id" = 4 THEN 'Boston'
        WHEN "project id" = 5 THEN 'Seattle'
        WHEN "project id" = 6 THEN 'Austin'
        WHEN "project id" = 7 THEN 'Denver'
        WHEN "project id" = 8 THEN 'Los Angeles'
        WHEN "project id" = 9 THEN 'Portland'
        WHEN "project id" = 10 THEN 'Miami'
        ELSE 'Unknown'
    END,
    "user" = CASE 
        WHEN "project id" = 1 THEN 'admin'
        WHEN "project id" = 2 THEN 'developer'
        WHEN "project id" = 3 THEN 'analyst'
        WHEN "project id" = 4 THEN 'security'
        WHEN "project id" = 5 THEN 'devops'
        WHEN "project id" = 6 THEN 'developer'
        WHEN "project id" = 7 THEN 'analyst'
        WHEN "project id" = 8 THEN 'developer'
        WHEN "project id" = 9 THEN 'devops'
        WHEN "project id" = 10 THEN 'designer'
        ELSE 'Unknown'
    END
WHERE place = 'Unknown' OR "user" = 'Unknown';

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_projects_place ON projects(place);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects("user"); 