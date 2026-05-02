ALTER TABLE articles_portaldpe
  ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_articles_portaldpe_scheduled_at
  ON articles_portaldpe (scheduled_at)
  WHERE status = 'scheduled';
