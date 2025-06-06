-- Add unit preference column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS unit_preference text DEFAULT 'kg' CHECK (unit_preference IN ('kg', 'lbs'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS users_unit_preference_idx ON public.users(unit_preference);

-- Enable realtime for users table if not already enabled
alter publication supabase_realtime add table users;
