CREATE TABLE public.training_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    lift_type text CHECK (lift_type IN ('squat', 'bench', 'deadlift')),
    training_date date NOT NULL,
    sets int NOT NULL,
    reps int NOT NULL,
    weight numeric NOT NULL,
    rpe numeric,
    volume numeric GENERATED ALWAYS AS (sets * reps * weight) STORED,
    estimated_1rm numeric GENERATED ALWAYS AS (weight * (1 + reps / 30.0)) STORED,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_training_history_user_date ON public.training_history(user_id, training_date);
CREATE INDEX idx_training_history_user_lift ON public.training_history(user_id, lift_type);

ALTER TABLE public.training_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only access their own training history" ON public.training_history;
CREATE POLICY "Users can only access their own training history"
ON public.training_history FOR ALL
USING (auth.uid() = user_id);

alter publication supabase_realtime add table training_history;