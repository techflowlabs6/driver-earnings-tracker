-- =========================================================================
-- DRIVER EARNINGS TRACKER - PREFIXED TABLES & DEDICATED SCHEMA
-- Prefix: driver_tracker_*
-- Target Domain: mytechflow.com/driver-ering
-- =========================================================================

-- 1. CREATE DEDICATED SCHEMA (Keeps all tables 100% separate from public schema)
CREATE SCHEMA IF NOT EXISTS driver_tracker;

-- Grant API access permissions to Supabase roles
GRANT USAGE ON SCHEMA driver_tracker TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA driver_tracker TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA driver_tracker TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA driver_tracker GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- Also support public schema fallback with prefixed table names
-- 2. PROFILES TABLE (driver_tracker_profiles)
CREATE TABLE IF NOT EXISTS driver_tracker.driver_tracker_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'driver' CHECK (role IN ('driver', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE driver_tracker.driver_tracker_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON driver_tracker.driver_tracker_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins read all profiles"
  ON driver_tracker.driver_tracker_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM driver_tracker.driver_tracker_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users insert/update own profile"
  ON driver_tracker.driver_tracker_profiles FOR ALL
  USING (auth.uid() = id);


-- 3. DAILY SHIFTS TABLE (driver_tracker_daily_shifts)
CREATE TABLE IF NOT EXISTS driver_tracker.driver_tracker_daily_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES driver_tracker.driver_tracker_profiles(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
  date_formatted TEXT NOT NULL,
  starting_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  last_shift_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_fare NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_tip NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_earnings NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  cash_in_hand NUMERIC(10, 2),
  net_company_owed NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

ALTER TABLE driver_tracker.driver_tracker_daily_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers manage own shifts"
  ON driver_tracker.driver_tracker_daily_shifts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all shifts"
  ON driver_tracker.driver_tracker_daily_shifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM driver_tracker.driver_tracker_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- 4. DELIVERY ENTRIES TABLE (driver_tracker_delivery_entries)
CREATE TABLE IF NOT EXISTS driver_tracker.driver_tracker_delivery_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES driver_tracker.driver_tracker_daily_shifts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES driver_tracker.driver_tracker_profiles(id) ON DELETE CASCADE,
  timestamp TEXT NOT NULL,
  time_formatted TEXT NOT NULL,
  fare NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  tip NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  cash_collected NUMERIC(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE driver_tracker.driver_tracker_delivery_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers manage own deliveries"
  ON driver_tracker.driver_tracker_delivery_entries FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all deliveries"
  ON driver_tracker.driver_tracker_delivery_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM driver_tracker.driver_tracker_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- 5. AUTOMATIC NEW USER PROFILE TRIGGER
CREATE OR REPLACE FUNCTION driver_tracker.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  extracted_name TEXT;
BEGIN
  extracted_name := INITCAP(REPLACE(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', ' '), '_', ' '));
  
  INSERT INTO driver_tracker.driver_tracker_profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(extracted_name, ''), 'Driver Account'),
    'driver'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION driver_tracker.handle_new_user();
