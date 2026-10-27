/**
 * Validation API Service
 *
 * Handles validation report generation and retrieval.
 */
import { apiClient } from "@/lib/api-client";

export interface ValidationReport {
  id: number;
  user: number;
  startup_name: string;
  industry: string;
  stage: string;
  overall_score: number;
  problem_score: number;
  market_score: number;
  solution_score: number;
  execution_score: number;
  financial_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  risk_factors: string[];
  market_size_estimate: string;
  competitor_analysis: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
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
   * Get the latest validation report.
   * GET /api/v1/validation-report/
   */
  getLatestReport: () =>
    apiClient.get<ValidationReport>("/api/v1/validation-report/"),
};