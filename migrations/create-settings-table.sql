-- Create settings table for storing application settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for the settings table
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Only allow admins to read settings
CREATE POLICY "Allow admins to read settings" ON settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only allow admins to insert/update settings
CREATE POLICY "Allow admins to insert settings" ON settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to update settings" ON settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS settings_key_idx ON settings (key);

-- Grant access to authenticated users (RLS will restrict based on role)
GRANT SELECT, INSERT, UPDATE ON settings TO authenticated;
