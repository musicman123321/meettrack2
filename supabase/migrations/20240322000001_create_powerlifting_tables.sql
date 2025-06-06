-- Create powerlifting-specific tables

-- Current stats table to track user's current lifting maxes
CREATE TABLE IF NOT EXISTS public.current_stats (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    weight numeric(5,2) NOT NULL DEFAULT 0,
    squat_max numeric(5,2) NOT NULL DEFAULT 0,
    bench_max numeric(5,2) NOT NULL DEFAULT 0,
    deadlift_max numeric(5,2) NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Meets table to track powerlifting competitions
CREATE TABLE IF NOT EXISTS public.meets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meet_name text,
    meet_date date NOT NULL,
    location text,
    target_weight_class numeric(5,2) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Meet goals table to track attempt selections for each lift
CREATE TABLE IF NOT EXISTS public.meet_goals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meet_id uuid NOT NULL REFERENCES public.meets(id) ON DELETE CASCADE,
    lift_type text NOT NULL CHECK (lift_type IN ('squat', 'bench', 'deadlift')),
    opener numeric(5,2) NOT NULL DEFAULT 0,
    second numeric(5,2) NOT NULL DEFAULT 0,
    third numeric(5,2) NOT NULL DEFAULT 0,
    confidence integer NOT NULL DEFAULT 5 CHECK (confidence >= 1 AND confidence <= 10),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, meet_id, lift_type)
);

-- Weight history table to track bodyweight over time
CREATE TABLE IF NOT EXISTS public.weight_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    weight numeric(5,2) NOT NULL,
    date date NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Equipment checklist table
CREATE TABLE IF NOT EXISTS public.equipment_checklist (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text NOT NULL CHECK (category IN ('essential', 'optional', 'meet-day')),
    checked boolean DEFAULT false,
    custom_item boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS current_stats_user_id_idx ON public.current_stats(user_id);
CREATE INDEX IF NOT EXISTS meets_user_id_idx ON public.meets(user_id);
CREATE INDEX IF NOT EXISTS meets_user_id_active_idx ON public.meets(user_id, is_active);
CREATE INDEX IF NOT EXISTS meet_goals_user_id_idx ON public.meet_goals(user_id);
CREATE INDEX IF NOT EXISTS meet_goals_meet_id_idx ON public.meet_goals(meet_id);
CREATE INDEX IF NOT EXISTS weight_history_user_id_idx ON public.weight_history(user_id);
CREATE INDEX IF NOT EXISTS weight_history_date_idx ON public.weight_history(date);
CREATE INDEX IF NOT EXISTS equipment_checklist_user_id_idx ON public.equipment_checklist(user_id);

-- Enable realtime for all tables
alter publication supabase_realtime add table current_stats;
alter publication supabase_realtime add table meets;
alter publication supabase_realtime add table meet_goals;
alter publication supabase_realtime add table weight_history;
alter publication supabase_realtime add table equipment_checklist;

-- RLS Policies (disabled by default as requested)
-- Note: Tables are created without RLS enabled for easier development
-- Enable RLS later if needed for production security
