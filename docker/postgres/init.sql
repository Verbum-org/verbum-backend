-- Initialize Verbum database
CREATE DATABASE verbum_db;
CREATE DATABASE verbum_db_dev;

-- Create extensions
\c verbum_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c verbum_db_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
\c verbum_db;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_moodle_id ON users("moodleId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_short_name ON courses("shortName");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_moodle_id ON courses("moodleId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_user_course ON enrollments("userId", "courseId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_user_course ON "userProgress"("userId", "courseId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_events_source ON "webhookEvents"("source");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_events_processed ON "webhookEvents"("processed");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_status ON jobs("status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_name ON jobs("name");

\c verbum_db_dev;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_moodle_id ON users("moodleId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_short_name ON courses("shortName");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_moodle_id ON courses("moodleId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_user_course ON enrollments("userId", "courseId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_user_course ON "userProgress"("userId", "courseId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_events_source ON "webhookEvents"("source");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_events_processed ON "webhookEvents"("processed");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_status ON jobs("status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_name ON jobs("name");
