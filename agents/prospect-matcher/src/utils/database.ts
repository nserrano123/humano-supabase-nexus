import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Prospect, JobPosition, ProspectEvaluation } from '../types/database.js';

export class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getProspects(): Promise<Prospect[]> {
    const { data, error } = await this.supabase
      .from('prospect')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch prospects: ${error.message}`);
    }

    return data || [];
  }

  async getProspectById(id: string): Promise<Prospect | null> {
    const { data, error } = await this.supabase
      .from('prospect')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch prospect: ${error.message}`);
    }

    return data;
  }

  async getOpenJobPositions(): Promise<JobPosition[]> {
    const { data, error } = await this.supabase
      .from('job_position')
      .select('*')
      .eq('is_open', true)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch job positions: ${error.message}`);
    }

    return data || [];
  }

  async getJobPositionById(id: string): Promise<JobPosition | null> {
    const { data, error } = await this.supabase
      .from('job_position')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch job position: ${error.message}`);
    }

    return data;
  }

  async getExistingEvaluation(prospectId: string, positionId: string): Promise<ProspectEvaluation | null> {
    const { data, error } = await this.supabase
      .from('prospect_evaluation')
      .select('*')
      .eq('prospect_id', prospectId)
      .eq('job_position_id', positionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch evaluation: ${error.message}`);
    }

    return data;
  }

  async createEvaluation(evaluation: Omit<ProspectEvaluation, 'id' | 'created_at'>): Promise<ProspectEvaluation> {
    const { data, error } = await this.supabase
      .from('prospect_evaluation')
      .insert(evaluation)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create evaluation: ${error.message}`);
    }

    return data;
  }

  async updateEvaluation(
    prospectId: string,
    positionId: string,
    updates: Partial<Pick<ProspectEvaluation, 'llm_score' | 'llm_evaluation'>>
  ): Promise<ProspectEvaluation> {
    const { data, error } = await this.supabase
      .from('prospect_evaluation')
      .update(updates)
      .eq('prospect_id', prospectId)
      .eq('job_position_id', positionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update evaluation: ${error.message}`);
    }

    return data;
  }

  async createProspect(prospect: Omit<Prospect, 'id' | 'created_at'>): Promise<Prospect> {
    const { data, error } = await this.supabase
      .from('prospect')
      .insert(prospect)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create prospect: ${error.message}`);
    }

    return data;
  }

  async deleteProspect(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('prospect')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete prospect: ${error.message}`);
    }
  }

  async deleteJobPosition(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('job_position')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete job position: ${error.message}`);
    }
  }

  async searchProspects(query: string): Promise<Prospect[]> {
    // Use text search across name, email, and profile_text
    const { data, error } = await this.supabase
      .from('prospect')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,profile_text.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search prospects: ${error.message}`);
    }

    return data || [];
  }

  async searchJobPositions(query: string): Promise<JobPosition[]> {
    // Use text search across name, description, and evaluation_criteria
    const { data, error } = await this.supabase
      .from('job_position')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,evaluation_criteria.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search job positions: ${error.message}`);
    }

    return data || [];
  }

  async getProspectsWithoutEvaluationForPosition(positionId: string): Promise<Prospect[]> {
    // Get all prospects that don't have an evaluation for this position
    const { data, error } = await this.supabase
      .rpc('get_prospects_without_evaluation', { position_id: positionId });

    if (error) {
      // If RPC doesn't exist, fall back to manual query
      const allProspects = await this.getProspects();
      const evaluatedProspects = await this.getEvaluationsForPosition(positionId);
      const evaluatedIds = new Set(evaluatedProspects.map(e => e.prospect_id));
      return allProspects.filter(p => !evaluatedIds.has(p.id));
    }

    return data || [];
  }

  async getEvaluationsForPosition(positionId: string): Promise<ProspectEvaluation[]> {
    const { data, error } = await this.supabase
      .from('prospect_evaluation')
      .select('*')
      .eq('job_position_id', positionId);

    if (error) {
      throw new Error(`Failed to fetch evaluations: ${error.message}`);
    }

    return data || [];
  }

  async getEvaluationsForProspect(prospectId: string): Promise<ProspectEvaluation[]> {
    const { data, error } = await this.supabase
      .from('prospect_evaluation')
      .select('*')
      .eq('prospect_id', prospectId);

    if (error) {
      throw new Error(`Failed to fetch evaluations: ${error.message}`);
    }

    return data || [];
  }
}
