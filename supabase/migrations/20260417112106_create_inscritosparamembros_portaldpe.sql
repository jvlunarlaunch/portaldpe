CREATE TABLE IF NOT EXISTS inscritosparamembros_portaldpe (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  age integer,
  phone text,
  email text,
  address text,
  voting_location text,
  instagram text,
  referral text,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inscritosparamembros_portaldpe ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_public" ON inscritosparamembros_portaldpe
  FOR INSERT TO anon WITH CHECK (true);
