/**
 * Recommendations & Motivations API Service
 *
 * Real-time dynamic founder wisdom and daily tactical directives
 * generated from iconic real-world founders and operators.
 */
import { apiClient } from "@/lib/api-client";

export interface FounderQuote {
  text: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  historical_context: string;
}

export interface VentureRelevance {
  headline: string;
  explanation: string;
  actionable_takeaway: string;
  stage_context: string;
}

export interface CaseStudy {
  title: string;
  problem_faced: string;
  tactical_action: string;
  key_lesson: string;
}

export interface DailyDirective {
  title: string;
  action: string;
  rationale: string;
  urgency: string;
  time_estimate: string;
}

export interface DynamicMotivationResponse {
  quote: FounderQuote;
  venture_relevance: VentureRelevance;
  case_study: CaseStudy;
  daily_directive: DailyDirective;
  startup_name: string;
  sector: string;
  stage: string;
  generated_at: string;
}

export const recommendationsApi = {
  getMotivations: (refresh?: boolean): Promise<DynamicMotivationResponse> => {
    return apiClient.get<DynamicMotivationResponse>(
      `/api/v1/recommendations/motivations/${refresh ? "?refresh=true" : ""}`
    );
  },
  refreshMotivations: (): Promise<DynamicMotivationResponse> => {
    return apiClient.post<DynamicMotivationResponse>(
      "/api/v1/recommendations/motivations/",
      {}
    );
  },
};

