-- Add grade_level column to visualizers table
ALTER TABLE visualizers 
ADD COLUMN grade_level VARCHAR(50);

-- Optional: Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_visualizers_grade_level 
ON visualizers(grade_level);

-- Optional: Add a comment to document the column
COMMENT ON COLUMN visualizers.grade_level IS 'Grade level for the visual aid (e.g., "3rd Grade", "Kindergarten")';