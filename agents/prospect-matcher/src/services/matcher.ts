import OpenAI from 'openai';
import type { Prospect, JobPosition, MatchResult } from '../types/database.js';

export class MatcherService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('Missing OpenAI API key. Please set OPENAI_API_KEY');
    }

    this.openai = new OpenAI({ apiKey });
  }

  async matchProspectToPosition(prospect: Prospect, position: JobPosition): Promise<MatchResult> {
    const profileText = prospect.profile_text || 'No profile information available';
    const evaluationCriteria = position.evaluation_criteria;

    const prompt = this.buildMatchingPrompt(prospect, profileText, position, evaluationCriteria);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert recruitment specialist with deep experience in talent evaluation and job matching.
Your task is to analyze candidate profiles against job requirements and provide detailed, objective assessments.
Always be fair, unbiased, and thorough in your evaluation.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(content);

      return {
        prospect_id: prospect.id,
        position_id: position.id,
        match_score: Math.min(100, Math.max(0, result.match_score)),
        strengths: result.strengths || [],
        gaps: result.gaps || [],
        recommendation: result.recommendation || '',
        detailed_analysis: result.detailed_analysis || ''
      };
    } catch (error) {
      console.error('Error in OpenAI matching:', error);
      throw new Error(`Failed to match prospect to position: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async batchMatchProspect(prospect: Prospect, positions: JobPosition[]): Promise<MatchResult[]> {
    const results: MatchResult[] = [];

    for (const position of positions) {
      try {
        const result = await this.matchProspectToPosition(prospect, position);
        results.push(result);
      } catch (error) {
        console.error(`Failed to match prospect ${prospect.id} to position ${position.id}:`, error);
        // Continue with other positions even if one fails
      }
    }

    return results;
  }

  async batchMatchPosition(prospects: Prospect[], position: JobPosition): Promise<MatchResult[]> {
    const results: MatchResult[] = [];

    for (const prospect of prospects) {
      try {
        const result = await this.matchProspectToPosition(prospect, position);
        results.push(result);
      } catch (error) {
        console.error(`Failed to match prospect ${prospect.id} to position ${position.id}:`, error);
        // Continue with other prospects even if one fails
      }
    }

    // Sort by match score descending
    return results.sort((a, b) => b.match_score - a.match_score);
  }

  private buildMatchingPrompt(
    prospect: Prospect,
    profileText: string,
    position: JobPosition,
    evaluationCriteria: string
  ): string {
    return `Analyze the following candidate profile against the job position requirements and provide a detailed matching assessment.

**CANDIDATE PROFILE:**
Name: ${prospect.name || 'Unknown'}
${prospect.email ? `Email: ${prospect.email}` : ''}
${prospect.linkedin_url ? `LinkedIn: ${prospect.linkedin_url}` : ''}

Profile Details:
${profileText}

${prospect.profile_json ? `\nStructured Data:\n${JSON.stringify(prospect.profile_json, null, 2)}` : ''}

---

**JOB POSITION:**
Title: ${position.name}
Description: ${position.description}
${position.long_description ? `\nDetailed Description:\n${position.long_description}` : ''}

Evaluation Criteria:
${evaluationCriteria}

Department: ${position.department || 'Not specified'}
Work Mode: ${position.work_mode || 'Not specified'}
Score Threshold: ${position.llm_score_threshold}

---

**INSTRUCTIONS:**
Perform a comprehensive semantic analysis comparing the candidate's background, skills, and experience against the job requirements. Consider:

1. **Technical Skills Match**: How well do the candidate's technical skills align with requirements?
2. **Experience Relevance**: Is the candidate's experience relevant to the role?
3. **Cultural & Soft Skills**: Does the candidate demonstrate qualities that fit the role?
4. **Growth Potential**: Can the candidate grow into areas where they may lack experience?
5. **Red Flags**: Are there any concerning gaps or misalignments?

Return your analysis as a JSON object with the following structure:
{
  "match_score": <number between 0-100>,
  "strengths": [
    "List 3-5 key strengths where the candidate excels",
    "Be specific and reference actual qualifications"
  ],
  "gaps": [
    "List 2-4 areas where the candidate falls short",
    "Be constructive and specific"
  ],
  "recommendation": "A 1-2 sentence summary recommendation (Highly Recommended / Recommended / Consider / Not Recommended)",
  "detailed_analysis": "A comprehensive 2-3 paragraph analysis explaining the match score and key factors"
}

**SCORING GUIDELINES:**
- 90-100: Exceptional fit - Exceeds most requirements
- 70-89: Strong fit - Meets most requirements with minor gaps
- 45-69: Moderate fit - Meets some requirements, notable gaps
- 25-44: Weak fit - Significant gaps in key areas
- 0-24: Poor fit - Does not meet fundamental requirements

Provide objective, evidence-based assessment. Focus on facts from the profile.`;
  }

  async semanticSearch(query: string, candidates: Prospect[], limit: number = 10): Promise<Prospect[]> {
    // Use OpenAI embeddings for semantic search
    try {
      const queryEmbedding = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query
      });

      // For now, return a simple text-based search
      // In production, you'd store embeddings and use vector similarity
      const results = candidates.filter(candidate => {
        const searchText = `${candidate.name} ${candidate.email} ${candidate.profile_text}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      });

      return results.slice(0, limit);
    } catch (error) {
      console.error('Error in semantic search:', error);
      // Fallback to simple text search
      const results = candidates.filter(candidate => {
        const searchText = `${candidate.name} ${candidate.email} ${candidate.profile_text}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      });
      return results.slice(0, limit);
    }
  }
}
