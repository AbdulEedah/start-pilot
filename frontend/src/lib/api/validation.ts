/**
 * Validation API Service
 *
 * Handles validation report generation and retrieval.
 */
import { apiClient } from "@/lib/api-client";

export interface ValidationReport {
  id: number;
  profile_id?: number;
  score: number;
  score_label: string;
  viability_percentage?: number;
  market_feasibility_score?: number;
  solution_effectiveness_score?: number;
  risk_index_score?: number;
  founder_readiness_score?: number;
  risk_level?: string;
  viability_level?: string;
  executive_summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  risks: string[];
  recommendations: string[];
  market_analysis: string;
  competitor_analysis: string;
  founder_readiness: string;
  sector_considerations: string;
  action_plan: string;
  generated_at?: string;

  // Legacy compatibility fields if needed
  overall_score?: number;
  summary?: string;
  risk_factors?: string[];
  status?: "pending" | "processing" | "completed" | "failed";
}

export interface ValidationPayload {
  startup_name: string;
  industry: string;
  stage: string;
  description: string;
  problem_statement: string;
  target_market: string;
  business_model: string;
  funding_raised?: string;
  team_size?: number;
  website?: string;
}

export const validationApi = {
  /**
   * Create a new validation report (triggers AI analysis).
   * POST /api/v1/validation-report/
   */
  createReport: (data: ValidationPayload) =>
    apiClient.post<ValidationReport>("/api/v1/validation-report/", data),

  /**
   * Get the latest validation report (with optional force-refresh).
   * GET /api/v1/validation-report/
   */
  getLatestReport: (force: boolean = false) =>
    apiClient.get<ValidationReport>(`/api/v1/validation-report/${force ? "?force=true" : ""}`),

  /**
   * Re-analyze venture viability automatically with AI.
   * POST /api/v1/validation-report/reanalyze/
   */
  reanalyze: () =>
    apiClient.post<ValidationReport>("/api/v1/validation-report/reanalyze/"),
};