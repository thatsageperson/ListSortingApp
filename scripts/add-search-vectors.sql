-- Migration: Add full-text search support to lists and list_items
-- Run this against your Neon PostgreSQL database.

-- 1. Add tsvector columns
ALTER TABLE lists ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE list_items ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Create GIN indexes for fast full-text search
CREATE INDEX IF NOT EXISTS idx_lists_search ON lists USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_list_items_search ON list_items USING GIN (search_vector);

-- 3. Backfill existing rows
UPDATE lists SET search_vector =
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B');

UPDATE list_items SET search_vector =
  setweight(to_tsvector('english', COALESCE(content, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(notes, '')), 'B');

-- 4. Trigger to auto-update lists.search_vector on INSERT/UPDATE
CREATE OR REPLACE FUNCTION lists_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lists_search_vector_trigger ON lists;
CREATE TRIGGER lists_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name, description ON lists
  FOR EACH ROW EXECUTE FUNCTION lists_search_vector_update();

-- 5. Trigger to auto-update list_items.search_vector on INSERT/UPDATE
CREATE OR REPLACE FUNCTION list_items_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.notes, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS list_items_search_vector_trigger ON list_items;
CREATE TRIGGER list_items_search_vector_trigger
  BEFORE INSERT OR UPDATE OF content, notes ON list_items
  FOR EACH ROW EXECUTE FUNCTION list_items_search_vector_update();
