export interface Prospect {
  id: string;
  agent_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  profile_text: string | null;
  profile_json: Record<string, any> | null;
  created_at: string;
}

export interface JobPosition {
  id: string;
  name: string;
  description: string;
  long_description: string | null;
  evaluation_criteria: string;
  llm_score_threshold: number;
  department: string | null;
  work_mode: string | null;
  is_open: boolean;
  active: boolean;
  open_positions: number | null;
  positions_hired: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface ProspectEvaluation {
  id?: string;
  prospect_id: string;
  job_position_id: string;
  llm_score: number | null;
  llm_evaluation: string | null;
  created_at?: string;
}

export interface MatchResult {
  prospect_id: string;
  position_id: string;
  match_score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  detailed_analysis: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string | null;
  github_url: string | null;
  created_at: string;
}
