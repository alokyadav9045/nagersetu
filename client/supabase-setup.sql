-- Enable RLS
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS issue_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    role TEXT CHECK (role IN ('citizen', 'admin', 'authority', 'moderator')) DEFAULT 'citizen',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table if it doesn't exist
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

-- Create issues table if it doesn't exist
CREATE TABLE IF NOT EXISTS issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    category TEXT,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
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

-- Create issue_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS issue_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id),
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create issue_votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS issue_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id),
    vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(issue_id, user_id)
);

-- Create issue_updates table if it doesn't exist
CREATE TABLE IF NOT EXISTS issue_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id),
    old_status TEXT,
    new_status TEXT,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, description, icon, color) VALUES
    ('Water Supply', 'Issues related to water supply and quality', 'droplets', 'blue'),
    ('Roads & Infrastructure', 'Road maintenance, potholes, traffic issues', 'road', 'gray'),
    ('Electricity', 'Power outages, electrical problems', 'zap', 'yellow'),
    ('Waste Management', 'Garbage collection, cleanliness issues', 'trash-2', 'green'),
    ('Public Safety', 'Safety concerns, crime, security', 'shield', 'red'),
    ('Healthcare', 'Public health, hospitals, medical services', 'heart', 'pink'),
    ('Education', 'Schools, educational facilities', 'book', 'purple'),
    ('Other', 'Other civic issues', 'more-horizontal', 'gray')
ON CONFLICT (name) DO NOTHING;

-- RLS Policies

-- user_profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'authority', 'moderator')
        )
    );

DROP POLICY IF EXISTS "Public read access to user_profiles" ON user_profiles;
CREATE POLICY "Public read access to user_profiles" ON user_profiles
    FOR SELECT USING (true);

-- issues policies
DROP POLICY IF EXISTS "Anyone can view issues" ON issues;
CREATE POLICY "Anyone can view issues" ON issues
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create issues" ON issues;
CREATE POLICY "Authenticated users can create issues" ON issues
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own issues" ON issues;
CREATE POLICY "Users can update their own issues" ON issues
    FOR UPDATE USING (citizen_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update any issue" ON issues;
CREATE POLICY "Admins can update any issue" ON issues
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'authority', 'moderator')
        )
    );

-- categories policies
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

-- issue_comments policies
DROP POLICY IF EXISTS "Anyone can view comments" ON issue_comments;
CREATE POLICY "Anyone can view comments" ON issue_comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON issue_comments;
CREATE POLICY "Authenticated users can create comments" ON issue_comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- issue_votes policies
DROP POLICY IF EXISTS "Anyone can view votes" ON issue_votes;
CREATE POLICY "Anyone can view votes" ON issue_votes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote" ON issue_votes;
CREATE POLICY "Authenticated users can vote" ON issue_votes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own votes" ON issue_votes;
CREATE POLICY "Users can update their own votes" ON issue_votes
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own votes" ON issue_votes;
CREATE POLICY "Users can delete their own votes" ON issue_votes
    FOR DELETE USING (user_id = auth.uid());

-- issue_updates policies
DROP POLICY IF EXISTS "Anyone can view issue updates" ON issue_updates;
CREATE POLICY "Anyone can view issue updates" ON issue_updates
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can create issue updates" ON issue_updates;
CREATE POLICY "Admins can create issue updates" ON issue_updates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'authority', 'moderator')
        )
    );

-- Create functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
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

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
