-- Migration: Add rich text notes and pinning support
-- Run this against your existing database to add the new columns.

-- Add new columns to list_items
ALTER TABLE list_items ADD COLUMN IF NOT EXISTS rich_content JSONB;
ALTER TABLE list_items ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE list_items ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP;

-- Index for pinned items ordering
CREATE INDEX IF NOT EXISTS idx_list_items_pinned ON list_items(list_id, is_pinned DESC, pinned_at DESC);

-- Update the search trigger to also fire on rich_content changes
-- (The app populates the `notes` column with plain text extracted from rich_content)
DROP TRIGGER IF EXISTS list_items_search_vector_trigger ON list_items;
CREATE TRIGGER list_items_search_vector_trigger
  BEFORE INSERT OR UPDATE OF content, notes, rich_content ON list_items
  FOR EACH ROW EXECUTE FUNCTION list_items_search_vector_update();

-- Backfill: convert existing non-null notes to minimal TipTap JSON
UPDATE list_items
SET rich_content = jsonb_build_object(
  'type', 'doc',
  'content', jsonb_build_array(
    jsonb_build_object(
      'type', 'paragraph',
      'content', jsonb_build_array(
        jsonb_build_object('type', 'text', 'text', notes)
      )
    )
  )
)
WHERE notes IS NOT NULL AND notes != '' AND rich_content IS NULL;
