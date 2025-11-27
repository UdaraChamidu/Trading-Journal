-- Create social_posts table for the Social Hub feature
DROP TABLE IF EXISTS social_posts;
CREATE TABLE social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  images text[] DEFAULT '{}',
  type text NOT NULL CHECK (type IN ('post', 'trade', 'idea')),
  trade_details jsonb,
  likes uuid[] DEFAULT '{}',
  comments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
-- ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Temporarily disable RLS for testing
ALTER TABLE social_posts DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all social posts" ON social_posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON social_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON social_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON social_posts;

-- Create policies
CREATE POLICY "Users can view all social posts"
  ON social_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own posts"
  ON social_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON social_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON social_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX idx_social_posts_created_at ON social_posts(created_at DESC);
CREATE INDEX idx_social_posts_type ON social_posts(type);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images');

CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'images');