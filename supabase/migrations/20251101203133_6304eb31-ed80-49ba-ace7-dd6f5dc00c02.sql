-- Enable RLS on new tables
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_job_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for activity_log (read-only for now)
CREATE POLICY "Allow all authenticated users to read activity log"
ON activity_log FOR SELECT
TO authenticated
USING (true);

-- RLS policies for candidate_job_applications
CREATE POLICY "Allow all authenticated users to manage applications"
ON candidate_job_applications FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Update convert function to set search_path
CREATE OR REPLACE FUNCTION convert_prospect_to_candidate(
  p_prospect_id uuid,
  p_job_position_id uuid DEFAULT NULL,
  p_override_duplicate boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prospect prospect%ROWTYPE;
  v_candidate_id uuid;
  v_existing_candidate_id uuid;
  v_result jsonb;
BEGIN
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
  
  IF v_existing_candidate_id IS NOT NULL AND p_override_duplicate THEN
    v_candidate_id := v_existing_candidate_id;
    
    UPDATE candidate 
    SET prospect_id = p_prospect_id
    WHERE id = v_candidate_id AND prospect_id IS NULL;
  ELSE
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
  
  UPDATE prospect 
  SET status = 'converted' 
  WHERE id = p_prospect_id;
  
  IF p_job_position_id IS NOT NULL THEN
    INSERT INTO candidate_job_applications (
      candidate_id, job_position_id, status
    ) VALUES (
      v_candidate_id, p_job_position_id, 'applied'
    ) ON CONFLICT (candidate_id, job_position_id) DO NOTHING;
  END IF;
  
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