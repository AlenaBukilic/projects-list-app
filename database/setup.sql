-- Create the projects table
CREATE TABLE IF NOT EXISTS projects (
    "project id" SERIAL PRIMARY KEY,
    "project name" VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    applicant VARCHAR(255) NOT NULL,
    "submission date" DATE NOT NULL DEFAULT CURRENT_DATE,
    place VARCHAR(255) NOT NULL DEFAULT 'Unknown',
    "user" VARCHAR(255) NOT NULL DEFAULT 'Unknown'
);

-- Insert sample data
INSERT INTO projects ("project name", status, applicant, "submission date", place, "user") VALUES
('E-commerce Platform Redesign', 'approved', 'John Smith', '2024-01-15', 'New York', 'admin'),
('Mobile App Development', 'in-progress', 'Sarah Johnson', '2024-01-20', 'San Francisco', 'developer'),
('Database Migration Project', 'pending', 'Mike Wilson', '2024-01-25', 'Chicago', 'analyst'),
('Website Security Audit', 'approved', 'Emily Davis', '2024-01-10', 'Boston', 'security'),
('Cloud Infrastructure Setup', 'rejected', 'David Brown', '2024-01-30', 'Seattle', 'devops'),
('API Integration Service', 'in-progress', 'Lisa Anderson', '2024-02-01', 'Austin', 'developer'),
('Data Analytics Dashboard', 'pending', 'Robert Taylor', '2024-02-05', 'Denver', 'analyst'),
('User Authentication System', 'approved', 'Jennifer Lee', '2024-01-28', 'Los Angeles', 'developer'),
('Performance Optimization', 'in-progress', 'Michael Chen', '2024-02-03', 'Portland', 'devops'),
('Content Management System', 'pending', 'Amanda White', '2024-02-07', 'Miami', 'designer');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_submission_date ON projects("submission date");
CREATE INDEX IF NOT EXISTS idx_projects_applicant ON projects(applicant);
CREATE INDEX IF NOT EXISTS idx_projects_place ON projects(place);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects("user"); 