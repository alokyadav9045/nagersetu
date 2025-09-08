-- =========================================
-- FIXED SUPABASE DATABASE SETUP SCRIPT
-- This fixes the infinite recursion in RLS policies
-- =========================================

-- First, drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public read access" ON user_profiles;
DROP POLICY IF EXISTS "Public read access" ON issues;
DROP POLICY IF EXISTS "Public read access" ON categories;

-- Disable RLS temporarily to avoid issues
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;

-- Create tables with proper structure
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    role TEXT DEFAULT 'citizen',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    category TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    location_lat DECIMAL,
    location_lng DECIMAL,
    location_address TEXT,
    location TEXT,
    images TEXT[],
    citizen_id UUID REFERENCES user_profiles(id),
    assigned_to UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories (only if they don't exist)
INSERT INTO categories (name, description, icon, color) VALUES
    ('Water Supply', 'Issues related to water supply and quality', 'droplets', 'blue'),
    ('Roads & Infrastructure', 'Road maintenance, potholes, traffic issues', 'road', 'gray'),
    ('Electricity', 'Power outages, electrical problems', 'zap', 'yellow'),
    ('Waste Management', 'Garbage collection, cleanliness issues', 'trash-2', 'green'),
    ('Other', 'Other civic issues', 'more-horizontal', 'gray')
ON CONFLICT (name) DO NOTHING;

-- Insert sample user profiles for testing
INSERT INTO user_profiles (email, full_name, role) VALUES
    ('admin@nagarsetu.com', 'Admin User', 'admin'),
    ('citizen1@example.com', 'John Doe', 'citizen'),
    ('citizen2@example.com', 'Jane Smith', 'citizen')
ON CONFLICT (email) DO NOTHING;

-- Insert sample issues for testing
INSERT INTO issues (title, description, category, status, priority) VALUES
    ('Broken Street Light', 'Street light on Main Street is not working', 'Infrastructure', 'pending', 'medium'),
    ('Water Supply Issue', 'No water supply in Block A', 'Water Supply', 'in-progress', 'high'),
    ('Garbage Collection', 'Garbage not collected for 3 days', 'Waste Management', 'resolved', 'low')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- Allow public read access to all tables (no user authentication required)
CREATE POLICY "Allow public read access" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON issues FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);

-- Allow public insert/update/delete for testing (you can restrict this later)
CREATE POLICY "Allow public insert" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON user_profiles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON user_profiles FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON issues FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON issues FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON issues FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON categories FOR DELETE USING (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;
CREATE TRIGGER update_issues_updated_at 
    BEFORE UPDATE ON issues 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the setup
SELECT 'Tables created successfully!' as message;
SELECT 'Categories count:' as info, COUNT(*) as count FROM categories;
SELECT 'Users count:' as info, COUNT(*) as count FROM user_profiles;
SELECT 'Issues count:' as info, COUNT(*) as count FROM issues;
