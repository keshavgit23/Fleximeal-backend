-- Rename student_profiles to user_profiles
ALTER TABLE student_profiles
RENAME TO user_profiles;

-- Remove student-specific fields
ALTER TABLE user_profiles
DROP COLUMN college_name;

ALTER TABLE user_profiles
DROP COLUMN college_city;

-- Add generic consumer profile field
ALTER TABLE user_profiles
ADD COLUMN profession VARCHAR(100);