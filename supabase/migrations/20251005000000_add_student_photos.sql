-- Add photo_url column to students table
ALTER TABLE students ADD COLUMN photo_url TEXT;

-- Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for authenticated users to upload photos
CREATE POLICY "Allow authenticated users to upload student photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'student-photos' 
  AND auth.role() = 'authenticated'
);

-- Create storage policy for public read access to student photos
CREATE POLICY "Allow public read access to student photos" ON storage.objects
FOR SELECT USING (bucket_id = 'student-photos');

-- Create storage policy for authenticated users to update student photos
CREATE POLICY "Allow authenticated users to update student photos" ON storage.objects
FOR UPDATE WITH CHECK (
  bucket_id = 'student-photos' 
  AND auth.role() = 'authenticated'
);

-- Create storage policy for authenticated users to delete student photos
CREATE POLICY "Allow authenticated users to delete student photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'student-photos' 
  AND auth.role() = 'authenticated'
);