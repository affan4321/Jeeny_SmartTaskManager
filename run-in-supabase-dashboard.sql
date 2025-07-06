-- ============================================
-- SUPABASE DATABASE SCHEMA FIX & REMINDER FIELD UPDATE
-- ============================================
-- Run this SQL in your Supabase dashboard > SQL Editor
-- This will fix the foreign key constraint issue AND update the reminder field

-- PART 1: ORIGINAL SCHEMA FIX
-- ============================================

-- 1. First, let's check if RLS is enabled on the "user" table
-- ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for the "user" table (if they don't exist)
DROP POLICY IF EXISTS "Users can view their own profile" ON "user";
CREATE POLICY "Users can view their own profile" ON "user"
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON "user";
CREATE POLICY "Users can update their own profile" ON "user"
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON "user";
CREATE POLICY "Users can insert their own profile" ON "user"
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Create function to automatically create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public."user" (id, email, created_at)
    VALUES (NEW.id, NEW.email, NOW());
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- 4. Create trigger to automatically create user record on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Insert user records for any existing auth users (CRITICAL FIX)
-- This is the most important part - it creates user records for existing auth users
INSERT INTO "user" (id, email, created_at)
SELECT 
    id, 
    email, 
    created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM "user")
ON CONFLICT (id) DO NOTHING;

-- 6. Verify and fix foreign key constraints
-- Drop and recreate foreign key constraints to ensure they're correct
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;
ALTER TABLE categories ADD CONSTRAINT categories_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- PART 2: REMINDER FIELD UPDATE
-- ============================================

-- 7. Add new reminder column (timestamp) to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder TIMESTAMPTZ;

-- 8. Copy existing reminder_minutes_before data to new reminder column
-- This converts the "minutes before deadline" to an actual timestamp
UPDATE tasks 
SET reminder = (deadline - INTERVAL '1 minute' * reminder_minutes_before)
WHERE reminder_minutes_before IS NOT NULL 
  AND deadline IS NOT NULL
  AND reminder IS NULL;

-- 9. Drop the old reminder_minutes_before column
ALTER TABLE tasks DROP COLUMN IF EXISTS reminder_minutes_before;

-- 10. Add index on reminder column for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_reminder ON tasks(reminder) WHERE reminder IS NOT NULL;

-- 11. Add index on reminder and completed columns for efficient notification queries
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_completed ON tasks(reminder, completed) WHERE reminder IS NOT NULL;

-- PART 3: VERIFICATION QUERIES
-- ============================================

-- 12. Optional: Check the results
-- SELECT 'Auth users:' as table_name, count(*) as count FROM auth.users
-- UNION ALL
-- SELECT 'User table:' as table_name, count(*) as count FROM "user"
-- UNION ALL
-- SELECT 'Tasks:' as table_name, count(*) as count FROM tasks
-- UNION ALL
-- SELECT 'Categories:' as table_name, count(*) as count FROM categories;

-- 13. Optional: Check tasks with reminders
-- SELECT 
--     title,
--     deadline,
--     reminder,
--     CASE 
--         WHEN reminder IS NOT NULL AND reminder <= NOW() THEN 'Due for reminder'
--         WHEN reminder IS NOT NULL THEN 'Future reminder'
--         ELSE 'No reminder'
--     END as reminder_status
-- FROM tasks 
-- WHERE reminder IS NOT NULL
-- ORDER BY reminder;

-- 14. Optional: Show table structure
-- SELECT 
--     column_name,
--     data_type,
--     is_nullable,
--     column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'tasks' 
-- ORDER BY ordinal_position;
