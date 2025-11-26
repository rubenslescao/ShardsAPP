-- ===================================
-- SUPABASE DATABASE SCHEMA
-- ===================================
-- Pour l'application SHARDS (GoalSync)
-- Copiez et collez ce script dans le SQL Editor de Supabase

-- Table: profiles (utilisateurs)
-- Cette table étend auth.users de Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    partner1_name TEXT NOT NULL,
    partner2_name TEXT,
    tracking_mode TEXT DEFAULT 'social' CHECK (tracking_mode IN ('solo', 'social', 'couple')),
    saved_sharing_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: goals
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL CHECK (char_length(title) <= 100),
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('relationship', 'fitness', 'skillup', 'adventure', 'financial', 'lifestyle', 'community')),
    timeframe TEXT NOT NULL CHECK (timeframe IN ('short-term', 'mid-term', 'long-term')),
    status TEXT DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'archived')),
    notes TEXT,
    sharing_level TEXT DEFAULT 'friends' CHECK (sharing_level IN ('private', 'friends', 'public', 'couple')),
    mode TEXT NOT NULL CHECK (mode IN ('solo', 'social', 'couple')),
    completion_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: couples
CREATE TABLE IF NOT EXISTS public.couples (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_a_id UUID REFERENCES public.profiles(id) NOT NULL,
    partner_b_id UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_partners UNIQUE (partner_a_id, partner_b_id),
    CONSTRAINT distinct_partners CHECK (partner_a_id != partner_b_id)
);

-- Add couple_id to profiles (after couples table exists)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES public.couples(id);

-- Add couple_id to goals (after couples table exists)
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES public.couples(id);

-- Add light_count tracking for Shards to Diamond mechanic
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS light_count INTEGER DEFAULT 0 CHECK (light_count >= 0);
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS target_light_count INTEGER DEFAULT 60 CHECK (target_light_count > 0);


-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);

-- Table: contributions (pour le tracking de momentum)
CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
    couple_id UUID REFERENCES public.couples(id) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    shard_count INTEGER DEFAULT 1 CHECK (shard_count > 0),
    is_confirmed BOOLEAN DEFAULT FALSE,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_contributions_couple_id ON public.contributions(couple_id);
CREATE INDEX IF NOT EXISTS idx_contributions_confirmed_at ON public.contributions(confirmed_at) WHERE is_confirmed = TRUE;
CREATE INDEX IF NOT EXISTS idx_contributions_goal_id ON public.contributions(goal_id);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_mode ON public.goals(mode);
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON public.goals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_couple_id ON public.goals(couple_id);
CREATE INDEX IF NOT EXISTS idx_couples_partners ON public.couples(partner_a_id, partner_b_id);
CREATE INDEX IF NOT EXISTS idx_profiles_couple_id ON public.profiles(couple_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour goals
DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================

-- Activer RLS sur les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
-- Les utilisateurs peuvent voir leur propre profil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Les utilisateurs peuvent insérer leur propre profil
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policies pour couples
-- Les utilisateurs peuvent voir leur propre couple
DROP POLICY IF EXISTS "Users can view own couple" ON public.couples;
CREATE POLICY "Users can view own couple"
    ON public.couples FOR SELECT
    USING (auth.uid() IN (partner_a_id, partner_b_id));

-- Policies pour goals (ROBUST RLS)
-- Les utilisateurs peuvent voir/modifier les goals s'ils sont propriétaires OU partenaires
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;
DROP POLICY IF EXISTS "Couples can view/edit own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert goals for their couple" ON public.goals;

-- SELECT/UPDATE/DELETE: User owns goal OR is partner via couples table
CREATE POLICY "Couples can view/edit own goals"
    ON public.goals
    FOR ALL
    USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM public.couples c
            WHERE 
                (c.partner_a_id = auth.uid() AND c.partner_b_id = goals.user_id)
                OR 
                (c.partner_b_id = auth.uid() AND c.partner_a_id = goals.user_id)
        )
    );

-- INSERT: User can only insert goals for their own couple
CREATE POLICY "Users can insert goals for their couple"
    ON public.goals
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND (
            couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
            OR couple_id IS NULL
        )
    );

-- Policies pour contributions
-- Les utilisateurs peuvent voir les contributions de leur couple
DROP POLICY IF EXISTS "Couples can view own contributions" ON public.contributions;
CREATE POLICY "Couples can view own contributions"
    ON public.contributions FOR SELECT
    USING (
        couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
    );

-- Les utilisateurs peuvent insérer des contributions pour leur couple
DROP POLICY IF EXISTS "Users can insert contributions" ON public.contributions;
CREATE POLICY "Users can insert contributions"
    ON public.contributions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid())
    );

-- Les utilisateurs peuvent mettre à jour leurs propres contributions
DROP POLICY IF EXISTS "Users can update own contributions" ON public.contributions;
CREATE POLICY "Users can update own contributions"
    ON public.contributions FOR UPDATE
    USING (auth.uid() = user_id);

-- ===================================
-- FONCTION POUR CRÉER UN PROFIL AUTOMATIQUEMENT
-- ===================================
-- Cette fonction crée automatiquement un profil lors de l'inscription

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, partner1_name, partner2_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'partner1_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'partner2_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ===================================
-- FONCTION POUR LIER DES PARTENAIRES
-- ===================================
CREATE OR REPLACE FUNCTION public.link_partners(
    partner_a_id UUID,
    partner_b_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_couple_id UUID;
BEGIN
    -- Validation: Ensure both profiles exist
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = partner_a_id) THEN
        RAISE EXCEPTION 'Partner A profile does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = partner_b_id) THEN
        RAISE EXCEPTION 'Partner B profile does not exist';
    END IF;
    
    -- Validation: Ensure neither user is already in a couple
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = partner_a_id AND couple_id IS NOT NULL) THEN
        RAISE EXCEPTION 'Partner A is already in a couple';
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = partner_b_id AND couple_id IS NOT NULL) THEN
        RAISE EXCEPTION 'Partner B is already in a couple';
    END IF;
    
    -- ATOMIC TRANSACTION: Create couple and update profiles
    INSERT INTO public.couples (partner_a_id, partner_b_id)
    VALUES (partner_a_id, partner_b_id)
    RETURNING id INTO new_couple_id;
    
    UPDATE public.profiles
    SET couple_id = new_couple_id
    WHERE id IN (partner_a_id, partner_b_id);
    
    RETURN new_couple_id;
END;
$$;

-- ===================================
-- FONCTION POUR CONFIRMER UNE CONTRIBUTION (LIGHT DROP)
-- ===================================
CREATE OR REPLACE FUNCTION public.confirm_contribution(
    contribution_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_contribution contributions%ROWTYPE;
    v_goal goals%ROWTYPE;
    v_confirming_user_couple_id UUID;
    v_result JSON;
BEGIN
    -- Get the contribution details
    SELECT * INTO v_contribution
    FROM public.contributions
    WHERE id = contribution_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contribution not found';
    END IF;
    
    -- Get confirming user's couple_id
    SELECT couple_id INTO v_confirming_user_couple_id
    FROM public.profiles
    WHERE id = auth.uid();
    
    IF v_confirming_user_couple_id IS NULL THEN
        RAISE EXCEPTION 'User is not in a couple';
    END IF;
    
    -- Security: Verify user is NOT the contributor (must be partner)
    IF auth.uid() = v_contribution.user_id THEN
        RAISE EXCEPTION 'You cannot confirm your own contribution';
    END IF;
    
    -- Security: Verify user is in the same couple
    IF v_confirming_user_couple_id != v_contribution.couple_id THEN
        RAISE EXCEPTION 'You can only confirm contributions from your couple';
    END IF;
    
    -- Check if already confirmed
    IF v_contribution.is_confirmed = TRUE THEN
        RAISE EXCEPTION 'Contribution already confirmed';
    END IF;
    
    -- ATOMIC TRANSACTION: Set is_confirmed and update goal light_count
    UPDATE public.contributions
    SET 
        is_confirmed = TRUE,
        confirmed_at = NOW()
    WHERE id = contribution_id;
    
    UPDATE public.goals
    SET light_count = COALESCE(light_count, 0) + v_contribution.shard_count
    WHERE id = v_contribution.goal_id
    RETURNING * INTO v_goal;
    
    -- Build result JSON
    v_result := json_build_object(
        'success', TRUE,
        'contribution_id', contribution_id,
        'goal_id', v_contribution.goal_id,
        'new_light_count', v_goal.light_count,
        'confirmed_at', NOW()
    );
    
    RETURN v_result;
END;
$$;

-- ===================================
-- TRIGGER POUR NOTIFIER LES UPDATES DE GOALS
-- ===================================
CREATE OR REPLACE FUNCTION notify_goal_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Postgres trigger automatically broadcasts via Realtime
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_goal_light_update ON public.goals;
CREATE TRIGGER trigger_goal_light_update
    AFTER UPDATE OF light_count ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION notify_goal_update();

-- ===================================
-- MATERIALIZED VIEW FOR STREAK TRACKING
-- ===================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.couple_streaks AS
WITH daily_activity AS (
    SELECT 
        c.couple_id,
        DATE(c.confirmed_at) as activity_date,
        COUNT(*) as daily_shards
    FROM public.contributions c
    WHERE c.is_confirmed = TRUE
    GROUP BY c.couple_id, DATE(c.confirmed_at)
),
streak_groups AS (
    SELECT 
        couple_id,
        activity_date,
        activity_date - (ROW_NUMBER() OVER (PARTITION BY couple_id ORDER BY activity_date))::INTEGER AS streak_group
    FROM daily_activity
),
streak_lengths AS (
    SELECT 
        couple_id,
        streak_group,
        MIN(activity_date) as streak_start,
        MAX(activity_date) as streak_end,
        COUNT(*) as streak_length
    FROM streak_groups
    GROUP BY couple_id, streak_group
)
SELECT 
    s.couple_id,
    MAX(s.streak_length) as max_streak,
    COALESCE(
        (SELECT streak_length 
         FROM streak_lengths 
         WHERE couple_id = s.couple_id 
           AND streak_end >= CURRENT_DATE - INTERVAL '1 day'
         ORDER BY streak_end DESC 
         LIMIT 1),
        0
    ) as current_streak,
    MAX(s.streak_end) as last_activity_date
FROM streak_lengths s
GROUP BY s.couple_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_couple_streaks_couple_id ON public.couple_streaks (couple_id);

-- ===================================
-- TRIGGER TO REFRESH STREAK VIEW
-- ===================================
CREATE OR REPLACE FUNCTION public.refresh_couple_streak()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.couple_streaks;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_refresh_streak ON public.contributions;
CREATE TRIGGER trigger_refresh_streak
    AFTER INSERT OR UPDATE OF is_confirmed ON public.contributions
    FOR EACH ROW
    WHEN (NEW.is_confirmed = TRUE)
    EXECUTE FUNCTION public.refresh_couple_streak();

-- ===================================
-- FUNCTION FOR HEATMAP DATA
-- ===================================
CREATE OR REPLACE FUNCTION public.get_heatmap_data(days INTEGER DEFAULT 90)
RETURNS TABLE (date DATE, shards BIGINT) AS $$
BEGIN
    RETURN QUERY
    WITH date_range AS (
        SELECT generate_series(
            CURRENT_DATE - (days - 1) * INTERVAL '1 day',
            CURRENT_DATE,
            '1 day'::interval
        )::DATE as date
    ),
    couple_contributions AS (
        SELECT 
            DATE(c.confirmed_at) as contribution_date,
            COUNT(*) as shard_count
        FROM public.contributions c
        INNER JOIN public.profiles p ON p.id = auth.uid()
        WHERE c.couple_id = p.couple_id
          AND c.is_confirmed = TRUE
          AND c.confirmed_at >= CURRENT_DATE - (days - 1) * INTERVAL '1 day'
        GROUP BY DATE(c.confirmed_at)
    )
    SELECT 
        dr.date,
        COALESCE(cc.shard_count, 0)::BIGINT
    FROM date_range dr
    LEFT JOIN couple_contributions cc ON dr.date = cc.contribution_date
    ORDER BY dr.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ===================================
-- FIN DU SCRIPT
-- ===================================
-- Votre base de données est maintenant configurée!
