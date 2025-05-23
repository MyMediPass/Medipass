-- Document Storage System Migration for Clerk Authentication
-- Creates tables for user document management with folders

-- Create user_documents table
CREATE TABLE IF NOT EXISTS user_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Changed from UUID to TEXT for Clerk user IDs
  file_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE, -- Supabase storage path
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL, -- MIME type
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('lab', 'prescription', 'imaging', 'insurance', 'general', 'report', 'immunization', 'photo')),
  folder_path TEXT DEFAULT '/',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  provider TEXT,
  date_taken TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_folders table
CREATE TABLE IF NOT EXISTS user_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Changed from UUID to TEXT for Clerk user IDs
  folder_name TEXT NOT NULL,
  folder_path TEXT NOT NULL,
  parent_folder_id UUID REFERENCES user_folders(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, folder_path)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_category ON user_documents(category);
CREATE INDEX IF NOT EXISTS idx_user_documents_folder ON user_documents(folder_path);
CREATE INDEX IF NOT EXISTS idx_user_documents_tags ON user_documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_documents_created_at ON user_documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_folders_user_id ON user_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_folders_parent ON user_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_user_folders_path ON user_folders(folder_path);

-- Enable RLS
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_documents using Clerk
-- Note: With Clerk, auth.uid() won't work, so we need different policies
-- These policies assume you'll pass the user_id from your application
CREATE POLICY "Users can read own documents" ON user_documents
  FOR SELECT USING (true); -- Will be enforced at application level

CREATE POLICY "Users can insert own documents" ON user_documents
  FOR INSERT WITH CHECK (true); -- Will be enforced at application level

CREATE POLICY "Users can update own documents" ON user_documents
  FOR UPDATE USING (true); -- Will be enforced at application level

CREATE POLICY "Users can delete own documents" ON user_documents
  FOR DELETE USING (true); -- Will be enforced at application level

-- RLS Policies for user_folders
CREATE POLICY "Users can read own folders" ON user_folders
  FOR SELECT USING (true); -- Will be enforced at application level

CREATE POLICY "Users can insert own folders" ON user_folders
  FOR INSERT WITH CHECK (true); -- Will be enforced at application level

CREATE POLICY "Users can update own folders" ON user_folders
  FOR UPDATE USING (true); -- Will be enforced at application level

CREATE POLICY "Users can delete own folders" ON user_folders
  FOR DELETE USING (true); -- Will be enforced at application level

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_documents
CREATE TRIGGER update_user_documents_updated_at 
    BEFORE UPDATE ON user_documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_folders TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Note: Since we're using Clerk instead of Supabase Auth, we handle user authorization
-- at the application level through the service role client with proper user_id filtering 