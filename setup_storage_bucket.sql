-- Create the visualizers storage bucket if it doesn't exist
-- Run this in your Supabase SQL Editor

-- Create storage bucket for visualizers
INSERT INTO storage.buckets (id, name, public)
VALUES ('visualizers', 'visualizers', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the visualizers bucket

-- Policy: Allow authenticated users to upload visualizers
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'visualizers' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow public access to read visualizers (since bucket is public)
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'visualizers');

-- Policy: Allow users to delete their own visualizers
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'visualizers' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow users to update their own visualizers
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'visualizers' 
  AND auth.role() = 'authenticated'
);