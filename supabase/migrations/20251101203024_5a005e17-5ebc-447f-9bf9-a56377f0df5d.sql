-- Add prospect_id to candidate table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidate' AND column_name = 'prospect_id'
  ) THEN
    ALTER TABLE candidate ADD COLUMN prospect_id uuid REFERENCES prospect(id);
    CREATE INDEX idx_candidate_prospect_id ON candidate(prospect_id);
  END IF;
END $$;

-- Add status column to prospect if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prospect' AND column_name = 'status'
  ) THEN
    ALTER TABLE prospect ADD COLUMN status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'archived'));
    CREATE INDEX idx_prospect_status ON prospect(status);
  END IF;
END $$;

-- Add status column to candidate if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidate' AND column_name = 'status'
  ) THEN
    ALTER TABLE candidate ADD COLUMN status text DEFAULT 'new' CHECK (status IN ('new', 'in_process', 'hired', 'rejected'));
    CREATE INDEX idx_candidate_status ON candidate(status);
  END IF;
END $$;

-- Create activity_log table for audit trail
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT now(),
  user_id uuid
);

CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- Create candidate_job_applications table if not exists
CREATE TABLE IF NOT EXISTS candidate_job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
  job_position_id uuid NOT NULL REFERENCES job_position(id) ON DELETE CASCADE,
  status text DEFAULT 'applied' CHECK (status IN ('applied', 'in_review', 'interview', 'offer', 'hired', 'rejected')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(candidate_id, job_position_id)
);

CREATE INDEX IF NOT EXISTS idx_candidate_applications_candidate ON candidate_job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_applications_job_position ON candidate_job_applications(job_position_id);

-- Add unique constraint to candidate email
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'candidate_email_unique'
  ) THEN
    ALTER TABLE candidate ADD CONSTRAINT candidate_email_unique UNIQUE(email);
  END IF;
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN others THEN NULL;
END $$;

-- Function to convert prospect to candidate
CREATE OR REPLACE FUNCTION convert_prospect_to_candidate(
  p_prospect_id uuid,
  p_job_position_id uuid DEFAULT NULL,
  p_override_duplicate boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prospect prospect%ROWTYPE;
  v_candidate_id uuid;
  v_existing_candidate_id uuid;
  v_result jsonb;
BEGIN
  -- Get prospect data
  SELECT * INTO v_prospect FROM prospect WHERE id = p_prospect_id;
  
  IF v_prospect.id IS NULL THEN
    RAISE EXCEPTION 'Prospect not found';
  END IF;
  
  IF v_prospect.status = 'converted' THEN
    RAISE EXCEPTION 'Prospect already converted';
  END IF;
  
  IF v_prospect.email IS NULL OR v_prospect.email = '' THEN
    RAISE EXCEPTION 'Prospect must have an email to be converted';
  END IF;
  
  -- Check for existing candidate with same email
  SELECT id INTO v_existing_candidate_id 
  FROM candidate 
  WHERE email = v_prospect.email 
  LIMIT 1;
  
  IF v_existing_candidate_id IS NOT NULL AND NOT p_override_duplicate THEN
    RETURN jsonb_build_object(
      'success', false,
      'duplicate', true,
      'existing_candidate_id', v_existing_candidate_id,
      'message', 'A candidate with this email already exists'
    );
  END IF;
  
  -- Create or update candidate
  IF v_existing_candidate_id IS NOT NULL AND p_override_duplicate THEN
    v_candidate_id := v_existing_candidate_id;
    
    -- Update existing candidate with prospect_id if not set
    UPDATE candidate 
    SET prospect_id = p_prospect_id,
        updated_at = now()
    WHERE id = v_candidate_id AND prospect_id IS NULL;
  ELSE
    -- Create new candidate
    INSERT INTO candidate (
      name, email, phone, linkedin_url, prospect_id, status
    ) VALUES (
      v_prospect.name,
      v_prospect.email,
      v_prospect.phone,
      v_prospect.linkedin_url,
      p_prospect_id,
      'new'
    ) RETURNING id INTO v_candidate_id;
  END IF;
  
  -- Update prospect status
  UPDATE prospect 
  SET status = 'converted' 
  WHERE id = p_prospect_id;
  
  -- Create job application if job_position_id provided
  IF p_job_position_id IS NOT NULL THEN
    INSERT INTO candidate_job_applications (
      candidate_id, job_position_id, status
    ) VALUES (
      v_candidate_id, p_job_position_id, 'applied'
    ) ON CONFLICT (candidate_id, job_position_id) DO NOTHING;
  END IF;
  
  -- Log activity
  INSERT INTO activity_log (
    entity_type, entity_id, action, details
  ) VALUES (
    'prospect',
    p_prospect_id,
    'prospect_converted_to_candidate',
    jsonb_build_object(
      'candidate_id', v_candidate_id,
      'job_position_id', p_job_position_id,
      'prospect_email', v_prospect.email
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'candidate_id', v_candidate_id,
    'duplicate', false,
    'message', 'Prospect converted successfully'
  );
END;
$$;