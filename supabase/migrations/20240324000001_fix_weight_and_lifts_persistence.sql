-- Fix weight logging and lift stats persistence issues
-- This migration addresses the following:
-- 1. Creates user_lifts table for independent lift tracking
-- 2. Updates weight_history constraint to allow upserts
-- 3. Ensures current_stats can be updated without active meets

-- Create user_lifts table for independent lift tracking
CREATE TABLE IF NOT EXISTS public.user_lifts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    lift_type text NOT NULL CHECK (lift_type IN ('squat', 'bench', 'deadlift')),
    max_weight numeric DEFAULT 0,
    confidence numeric CHECK (confidence >= 1 AND confidence <= 10),
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, lift_type)
);

-- Enable RLS on user_lifts table
ALTER TABLE public.user_lifts ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user_lifts
CREATE POLICY "Users can manage their own lifts" ON public.user_lifts
    FOR ALL USING (auth.uid()::text = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_lifts_user_id ON public.user_lifts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lifts_lift_type ON public.user_lifts(lift_type);

-- Update weight_history table to handle upserts better
-- The existing unique constraint should already handle this, but let's ensure it exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'weight_history_user_id_date_key'
    ) THEN
        ALTER TABLE public.weight_history 
        ADD CONSTRAINT weight_history_user_id_date_key UNIQUE (user_id, date);
    END IF;
END $$;

-- Create function to update current_stats weight when weight_history is updated
CREATE OR REPLACE FUNCTION update_current_stats_weight()
RETURNS TRIGGER AS $$
BEGIN
    -- Update current_stats with the latest weight
    INSERT INTO public.current_stats (user_id, weight, squat_max, bench_max, deadlift_max, created_at, updated_at)
    VALUES (NEW.user_id, NEW.weight, 0, 0, 0, NOW(), NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        weight = NEW.weight,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update current_stats when weight_history changes
DROP TRIGGER IF EXISTS trigger_update_current_stats_weight ON public.weight_history;
CREATE TRIGGER trigger_update_current_stats_weight
    AFTER INSERT OR UPDATE ON public.weight_history
    FOR EACH ROW
    EXECUTE FUNCTION update_current_stats_weight();

-- Grant necessary permissions
GRANT ALL ON public.user_lifts TO authenticated;
GRANT ALL ON public.user_lifts TO service_role;
