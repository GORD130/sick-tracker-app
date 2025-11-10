-- Initialize database for FluentUI application
-- This script runs when the PostgreSQL container starts

-- Create database if it doesn't exist (handled by POSTGRES_DB environment variable)
-- Create additional users or extensions if needed

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- You can add additional initialization here if needed
-- For example:
-- CREATE USER app_user WITH PASSWORD 'app_password';
-- GRANT ALL PRIVILEGES ON DATABASE fluentui_app TO app_user;